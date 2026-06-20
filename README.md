# cf-next-pages-routes

一个基于 **Next.js 静态导出 + Hono Cloudflare Worker** 的模板仓库。前端构建为纯静态文件部署到 Cloudflare Pages，API 以独立 Worker 运行，开发与生产均通过同域 `/api/*` 访问后端。

## 技术栈

**前端**
- [Next.js](https://nextjs.org) 16（Pages Router，`output: "export"` 静态导出）
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [shadcn/ui](https://ui.shadcn.com) 组件库（基于 Radix UI / Base UI）
- [Recharts](https://recharts.org)、[Embla Carousel](https://www.embla-carousel.com)、[cmdk](https://cmdk.paco.me)、[Sonner](https://sonner.emilkowal.ski)、[Vaul](https://github.com/emilkowalski/vaul) 等扩展组件

**后端**
- [Hono](https://hono.dev) — Cloudflare Worker 上的 Web 框架
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) — Worker 本地开发与部署
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — SQLite 数据库（已配置占位，按需启用）
- [`@cloudflare/workers-types`](https://www.npmjs.com/package/@cloudflare/workers-types) — Worker 类型定义

**工具链**
- [pnpm](https://pnpm.io) 包管理
- [TypeScript](https://www.typescriptlang.org) 5
- [ESLint](https://eslint.org) 9 + eslint-config-next
- [concurrently](https://github.com/open-cli-tools/concurrently) — 并发启动前端与后端 dev server

## 目录结构

```
src/
├── components/      # shadcn/ui 组件 + 业务组件
├── hooks/           # React hooks
├── lib/             # 浏览器端工具函数
├── pages/           # Next.js Pages Router 页面（静态导出）
├── shared/          # 前后端共享的类型与工具
├── styles/          # 全局样式 / Tailwind 主题
└── worker/          # Cloudflare Worker + Hono API
    ├── routes/      # 路由模块（health、hello）
    └── index.ts     # Worker 入口
wrangler.jsonc       # Worker 配置（D1 占位、无 routes）
next.config.ts       # 静态导出 + dev rewrites 代理
components.json      # shadcn 配置
```

## 快速开始

```bash
pnpm install
pnpm dev
```

`pnpm dev` 会并发启动：

| 服务 | 地址 |
|------|------|
| Next.js（前端） | http://localhost:3000 |
| Wrangler（Worker API） | http://localhost:8787 |

前端通过 `next.config.ts` 的 `rewrites` 将 `/api/*` 代理到 `:8787`，开发时浏览器直接请求同域 `/api/*` 即可，无需关心端口或 CORS。

示例接口：

```bash
curl http://localhost:3000/api/health   # {"ok":true}
curl http://localhost:3000/api/hello    # {"name":"John Doe"}
```

其他脚本：

```bash
pnpm build          # 静态导出到 out/
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm deploy:web     # 构建前端静态文件
pnpm deploy:worker  # wrangler deploy
```

## 架构

**开发环境**：`next dev` 与 `wrangler dev` 同时运行，Next.js 通过 `rewrites` 把 `/api/*` 转发到 Worker（`:8787`）。前后端同域（`localhost:3000`），前端代码统一使用相对路径 `/api/*`。

**生产环境**：Next.js 静态导出到 `out/`，部署到 Cloudflare Pages；Hono Worker 独立部署，并通过同域 route 绑定 `/api/*`，使生产环境同样以相对路径访问 API。

> 注意：`output: "export"` 模式下 `rewrites` 仅在 `next dev` 生效，生产环境依赖 Cloudflare 的同域 route，而非 Next 的 rewrites。

## 部署到 Cloudflare

1. **前端（Pages）**
   - 构建命令：`pnpm build`
   - 输出目录：`out`

2. **后端（Worker）**
   ```bash
   pnpm deploy:worker
   ```

3. **同域 route 绑定**：在 `wrangler.jsonc` 中为 Worker 绑定 `/api/*` 路由（替换为你的域名）：
   ```jsonc
   "routes": [
     { "pattern": "your-domain.com/api/*", "zone_name": "your-domain.com" }
   ]
   ```
   只绑定 `/api/*`，避免 Worker 接管整站覆盖 Pages 静态页面。

4. **D1（可选）**：`wrangler.jsonc` 中已保留 D1 占位配置，启用时替换 `database_id` 并参考 [Cloudflare D1 文档](https://developers.cloudflare.com/d1/) 创建数据库与应用迁移。

5. **敏感配置**：使用 `wrangler secret put <NAME>` 设置，不要放入前端环境变量。
