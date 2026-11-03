import type { AppDB } from "./db/client";

// Worker 全局复用的 Hono 环境类型。
// - db：createDbMiddleware 注入的 PostgreSQL drizzle 实例。
// - user：createAuthMiddleware 注入的当前用户，未挂载时为 undefined。
// DB 后端固定为 PostgreSQL；更换数据库时整体替换 db/ 与 @repo/db。
export type AppEnv = {
  Variables: {
    db: AppDB;
    user?: unknown;
  };
};
