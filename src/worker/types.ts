import type { D1Database } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/shared/schemas";

// Worker 全局复用的 Hono 环境类型。
// - Bindings：对应 wrangler.jsonc 里 d1_databases / vars 暴露给 Worker 的绑定。
//   当前只有 DB（D1）和 APP_ENV（vars）。新增绑定在此追加并在 wrangler.jsonc 配置。
// - Variables：中间件往上下文里写入的运行时值。
//   - db：createDbMiddleware 注入的 drizzle 实例，类型由本地 schema 推断。
//   - user：createAuthMiddleware 注入的当前用户，未挂载时为 undefined。
export type AppEnv = {
  Bindings: {
    DB: D1Database;
    APP_ENV: string;
  };
  Variables: {
    db: WorkerDB;
    user?: unknown;
  };
};

// drizzle D1 实例类型，schema 来自 @/shared/schemas。
// 路由里通过 c.get("db") 拿到时就是这个类型，query 会有完整的类型提示。
export type WorkerDB = DrizzleD1Database<typeof schema>;
