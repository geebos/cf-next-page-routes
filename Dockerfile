# 构建镜像 -- 先在 builder 里编译（Next 静态导出 + Hono 单文件产物），
# 运行镜像里只有 STATIC_ROOT（该部署模式的静态根）与 server.mjs，
# 不需要 pnpm / node_modules / tsx。
#
# 基础镜像不带私有 registry 前缀，按需用 --build-arg 或改本行接入镜像缓存。

# ---------- 阶段 1：安装依赖并构建 ----------
FROM node:22.19.0-alpine AS builder

WORKDIR /app

ENV CI=true \
    NEXT_TELEMETRY_DISABLED=1

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV npm_config_registry=${NPM_REGISTRY}

RUN npm install -g pnpm@10.12.3

# NEXT_PUBLIC_* 会在构建期内联进浏览器产物，必须作为构建参数传入。
# DEPLOY_MODE 决定静态根里装什么：both 全量、site 删媒体、assets 只留媒体
# （见 apps/frontend/scripts/prepare-static.ts）。
ARG NEXT_PUBLIC_BASE_URL=""
ARG NEXT_PUBLIC_ASSETS_BASE_URL=""
ARG DEPLOY_MODE=both
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \
    NEXT_PUBLIC_ASSETS_BASE_URL=${NEXT_PUBLIC_ASSETS_BASE_URL} \
    DEPLOY_MODE=${DEPLOY_MODE}

# 先复制依赖清单，最大化利用镜像层缓存。
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/tauri/package.json ./apps/tauri/
COPY packages/db/package.json ./packages/db/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/lib/package.json ./packages/lib/
COPY packages/schemas/package.json ./packages/schemas/

# pnpm store 走 BuildKit 缓存挂载：不进镜像层、跨构建复用。
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

COPY . .

# 1) Next 静态导出到 apps/frontend/out，并按 DEPLOY_MODE 裁剪
# 2) Hono 应用打包成单文件 apps/backend/dist/server.mjs
# 顺序不能颠倒：后端的 i18n 私有命名空间模块来自 codegen。
RUN pnpm build \
 && pnpm --filter @repo/backend build

# 断言：静态根与后端产物都必须存在，否则运行期只会 404。
# assets 模式的静态根可能为空（媒体清单为空），只检查目录存在。
RUN test -f apps/backend/dist/server.mjs \
 && case "$DEPLOY_MODE" in \
      assets) test -d apps/frontend/out ;; \
      *) test -f apps/frontend/out/index.html && test -f apps/frontend/out/404.html ;; \
    esac

# ---------- 阶段 2：运行 ----------
FROM node:22.19.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787 \
    STATIC_ROOT=/app/static

# 只会复制该部署模式的静态根（构建期已裁好）与单文件 Hono 服务。
COPY --from=builder /app/apps/frontend/out ./static
COPY --from=builder /app/apps/backend/dist/server.mjs ./server.mjs

# 以非 root 用户运行（node 镜像自带 node 用户，uid 1000）。
USER node

EXPOSE 8787

# 探针按部署模式选：assets 只验证进程可响应（白名单外一律 404），其余探健康接口。
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD node -e "const port=process.env.PORT||8787;const probe=process.env.DEPLOY_MODE==='assets'?'/':'/api/health';fetch('http://127.0.0.1:'+port+probe).then(r=>process.exit(process.env.DEPLOY_MODE==='assets'?(r.status===404?0:1):(r.ok?0:1))).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
