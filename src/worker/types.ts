import type { D1Database } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { sqliteSchema } from "@/shared/schemas";
import type { PostgresDB } from "./db/engine";

// Worker 全局复用的 Hono 环境类型。
// - Bindings：对应 wrangler.jsonc 里 d1_databases / vars 暴露给 Worker 的绑定。
//   注意：DB 仅在 DB_ENGINE=d1（默认）时使用；sqlite 引擎走 Node 文件连接，不读此绑定。
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

// drizzle 实例类型，schema 来自 @/shared/schemas。
// D1/SQLite 与 PostgreSQL 使用各自的 dialect table，路由通过 repository
// 隔离 table 差异；运行时引擎初始化见 worker/db/engine.ts。
export type WorkerDB =
  | DrizzleD1Database<typeof sqliteSchema>
  | BetterSQLite3Database<typeof sqliteSchema>
  | PostgresDB;
