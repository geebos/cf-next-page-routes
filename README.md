# cf-next-pages-routes

一个基于 **Next.js 静态导出 + Hono** 的模板仓库。前端构建为纯静态文件部署到 Cloudflare Pages，API 以独立 Node 服务运行（PostgreSQL），开发与生产均通过同域 `/api/*` 访问后端。

## 技术栈

**前端**
- [Next.js](https://nextjs.org) 16（Pages Router，`output: "export"` 静态导出）
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [shadcn/ui](https://ui.shadcn.com) 组件库（基于 Radix UI / Base UI）
- [Recharts](https://recharts.org)、[Embla Carousel](https://www.embla-carousel.com)、[cmdk](https://cmdk.paco.me)、[Sonner](https://sonner.emilkowal.ski)、[Vaul](https://github.com/emilkowalski/vaul) 等扩展组件

**后端**
- [Hono](https://hono.dev) — Web 框架（Node 运行时为 `@hono/node-server`）
- [PostgreSQL](https://www.postgresql.org/) + [`pg`](https://node-postgres.com/) — 唯一 DB 后端
- [Drizzle ORM](https://orm.drizzle.team/) / Drizzle Kit — 表定义与迁移
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) — 可选的 Cloudflare 部署入口

**工具链**
- [pnpm](https://pnpm.io) 包管理
- [TypeScript](https://www.typescriptlang.org) 5
- [ESLint](https://eslint.org) 9 + eslint-config-next
- [concurrently](https://github.com/open-cli-tools/concurrently) — 并发启动前端与后端 dev server

## 目录结构

本仓库是 pnpm workspace monorepo：`apps/` 下是三个可运行应用，`packages/` 下是共享库。

```
apps/
├── frontend/        # Next.js 前端（静态导出，含 components / hooks / i18n / styles）
│   └── src/lib/     # 前端专用工具（adapter/、api.ts、i18n-*）
├── backend/         # Hono API（Node 入口 serve.ts）
│   ├── src/         # index.ts 入口、routes/、middleware/、db/、lib/
│   └── wrangler.jsonc      # 可选的 Worker 部署配置（静态资源）
└── tauri/           # Tauri v2 壳工程（Rust + iOS gen/target）
packages/
├── schemas/         # @repo/schemas：前后端共享的 Zod schema 与类型
├── db/              # @repo/db：Drizzle 表定义 + 迁移（单一 DB 后端）
│   ├── src/todos.ts # 表定义（按业务域命名）
│   ├── migrations/  # 生成的迁移
│   └── drizzle.config.ts
├── i18n/            # @repo/i18n：locale 配置、文案源文件与编译器
│   ├── locales/     # public/ 与 private/，按 key 拆分的文案源
│   ├── src/         # settings、compiler、CLI
│   └── generated/   # gitignored，codegen 生成（manifest / public / private）
└── lib/             # @repo/lib：跨端复用的公共工具函数（cn 等）
```

DB 后端固定为 PostgreSQL，迁移、表定义、drizzle 配置都集中在 `@repo/db`；需要变更数据库时**整体替换** `packages/db` 与 `apps/backend/src/db`，不并行维护多套目录。

前端 `src/lib/utils.ts` 只是 `@repo/lib` 的再导出，用于保持 shadcn 的 `@/lib/utils` 别名不变。

## 快速开始

需要先准备一个 PostgreSQL，并把连接串写入 `apps/backend/.env`（参考 `apps/backend/.env.example`），后端 `dev` 会自动加载该文件。

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env   # 填入 POSTGRES_URL
pnpm db:migrate                                  # 应用 packages/db/migrations
pnpm dev
```

`pnpm dev` 会并发启动：

| 服务 | 地址 |
|------|------|
| Next.js（前端） | http://localhost:3000 |
| Hono + PostgreSQL（API） | http://localhost:8787 |

前端通过 `next.config.ts` 的 `rewrites` 将 `/api/*` 代理到 `:8787`，开发时浏览器直接请求同域 `/api/*` 即可，无需关心端口或 CORS。

示例接口：

```bash
curl http://localhost:3000/api/health   # {"ok":true}
curl http://localhost:3000/api/hello    # {"name":"John Doe"}
```

其他脚本：

```bash
pnpm build          # 静态导出到 apps/frontend/out/
pnpm typecheck      # 各 workspace 包 tsc --noEmit
pnpm lint           # eslint（frontend）
pnpm test           # 各 workspace 包 node:test
pnpm i18n:build     # 编译 packages/i18n/locales → generated/
pnpm db:generate    # drizzle-kit generate → packages/db/migrations
pnpm db:migrate     # drizzle-kit migrate（需 POSTGRES_URL）
```

环境变量：前端读取 `apps/frontend/.env`（模板见 `apps/frontend/.env.example`）；后端变量见 `apps/backend/.env.example`，由各 dev 脚本内联传入。

## 架构

**开发环境**：`next dev` 与后端 `tsx src/serve.ts`（PostgreSQL）同时运行，Next.js 通过 `rewrites` 把 `/api/*` 转发到 `:8787`。前后端同域（`localhost:3000`），前端代码统一使用相对路径 `/api/*`。

**生产环境**：Next.js 静态导出到 `apps/frontend/out/`，部署到 Cloudflare Pages；Hono API 作为独立 Node 服务部署并注入 `POSTGRES_URL`，通过同域 `/api/*` 反向代理访问。

> 注意：`output: "export"` 模式下 `rewrites` 仅在 `next dev` 生效，生产环境需要自行配置同域反向代理。

## 适配层（Adapters）

`apps/frontend/src/lib/adapter/` 统一封装 Tauri 原生能力与浏览器降级实现，上层代码无需关心运行环境。所有 API 请求统一走 `apps/frontend/src/lib/api.ts`（内部使用 `adapter/fetch`），不要直接使用原生 `fetch` 或 Tauri 插件。

| 模块 | Tauri | 浏览器降级 | 说明 |
|------|-------|-----------|------|
| `adapter/fetch` | `@tauri-apps/plugin-http` 的 `fetch` | `globalThis.fetch` | 绕过 Tauri 的 URL allow-list；`api.ts` 在 Tauri 中自动拼接绝对 URL，浏览器中走相对路径 |
| `adapter/dialog` | `@tauri-apps/plugin-dialog`（`confirm`/`message`） | `window.confirm`/`window.alert` | 统一的确认框/消息框 |
| `adapter/request` | Rust `proxy` 命令（`tauri_plugin_http::reqwest`） | 抛错（仅 Tauri 可用） | 透明 HTTP 请求，返回标准 `Response`；用于绕过 `adapter/fetch` 的限制、读取任意状态码/响应体 |

> `adapter/request` 仅在 Tauri 环境可用，依赖 Rust 侧的 `proxy` 命令（见 `apps/tauri/src/lib.rs`），已启用 gzip/brotli/deflate/zstd 自动解压。

## 国际化（i18n）

文案源文件、locale 配置和编译器集中在 `@repo/i18n`（`packages/i18n`）。详细规则见 `packages/i18n/README.md`。

```text
packages/i18n/
├── locales/public/<namespace>/...    # 公共文案，编译后由 SSG 注入页面 props
├── locales/private/<namespace>/...   # 私有文案，只进入后端 bundle
└── src/config.ts                     # 配置函数：defaultLocale + locales
```

- 文案按 JSON Path 拆分为多级 YAML 文件（`home.hero.title` → `home/hero.yml` 的 `title`），namespace 级区分 `public` / `private`。
- locale 配置是代码（`src/config.ts` 的 `getI18nConfig()`），不是 JSON 文件；编译器、前端和后端读同一个类型化值。
- codegen 生成 `generated/manifest.ts`（仅 namespace 名称）、`generated/public` 和 `generated/private`；`generated/` 不提交 git。
- `next dev` / `next build` 由 `next.config.ts` 自动执行 codegen；`apps/frontend` 的 `dev` 同时启动 `@repo/i18n` watcher。
- backend、根 `typecheck`、根 `test` 不加载 Next 配置，根脚本会先执行 `pnpm i18n:build`。
- 公共 namespace 由 `getStaticProps` 注入，无额外请求；私有 namespace 由前端统一 `useTranslation`（`@/lib/i18n`）按 manifest 自动请求 `GET /api/i18n/:locale/:namespace`。
- 私有路由经过 `createAuthMiddleware`，默认 resolver 拒绝（401）；响应带 `Cache-Control: private, no-store`。登出时调用 `clearPrivateI18n(i18n)` 清理客户端 bundle。

修改 `locales/**` 后运行 `pnpm i18n:build`（或直接 `pnpm dev`）。新增 locale 时在 `packages/i18n/src/config.ts` 的 `LOCALES` 中加一项即可，`AppLocale` 类型与编译器校验自动跟随。

## 数据库（Database）

本项目只有一个 DB 后端：**PostgreSQL**（`pg` + `drizzle-orm/node-postgres`）。

| 关注点 | 位置 |
|--------|------|
| API 校验 / 类型 / 领域辅助函数 | `@repo/schemas`（`packages/schemas`） |
| 表定义（按业务域命名）、迁移、drizzle 配置 | `@repo/db`（`packages/db`） |
| 连接（pg Pool + drizzle）、repository | `apps/backend/src/db/` |

连接串来自 `POSTGRES_URL`，只在后端进程读取，不会进入浏览器 bundle。`apps/backend` 的 `dev` 脚本会自动加载 `apps/backend/.env`（若存在，模板见 `apps/backend/.env.example`）。

需要更换数据库时**整体替换**上面三处（表定义 + 迁移 + 连接层），而不是并行维护多套目录或引擎分支。

**迁移（Migrations）**

```bash
pnpm db:generate   # 修改 packages/db/src/todos.ts 后生成 SQL 到 packages/db/migrations
pnpm db:migrate    # 应用迁移（读取 POSTGRES_URL）
```

## 部署

1. **前端（Pages）**
   - 构建命令：`pnpm build`
   - 输出目录：`apps/frontend/out`

2. **后端（Node + PostgreSQL）**
   - 启动入口：`apps/backend/src/serve.ts`（`@hono/node-server`，默认端口 8787，`PORT` 可覆盖）
   - 必需配置：`POSTGRES_URL`
   - 可选：`apps/backend/wrangler.jsonc` 保留了 `main`/assets 配置，如需部署到 Cloudflare Workers，自行注入 `POSTGRES_URL`（secret）并验证 PostgreSQL 连通性

3. **同域**：生产环境把 `/api/*` 与静态站点配置为同域（反向代理或 Worker route），前端代码只使用相对路径 `/api/*`

4. **敏感配置**：一律通过环境变量 / secret 管理，不要放入前端环境变量。

## Tauri iOS

仓库已包含 `apps/tauri/`（Tauri v2），可将同一套静态导出的 Next.js 前端打包成 iOS App。首次使用按以下步骤配置：

1. **安装 Rust**：参考 [rustup 官网](https://rustup.rs) 安装 Rust 工具链。

2. **安装 iOS Rust targets**：
   ```bash
   rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim
   ```

3. **初始化 iOS 工程**：
   ```bash
   pnpm tauri ios init
   ```
   生成 `apps/tauri/gen/apple/` 下的 Xcode 工程。

4. **配置签名**：用 Xcode 打开 `apps/tauri/gen/apple/native.xcodeproj`，在 Signing & Capabilities 中选择开发 Team（`apps/tauri/tauri.conf.json` 里已预填 `developmentTeam: 9CXCT8UD3F`，按需替换为你自己的 Team ID）。

5. **开发运行**：
   ```bash
   pnpm tauri ios dev
   ```

6. **编译 IPA**：
   ```bash
   pnpm tauri ios build
   ```
