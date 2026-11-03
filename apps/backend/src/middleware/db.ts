import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";
import { getDb } from "../db/client";

// 每个请求注入唯一的 PostgreSQL drizzle 实例（进程级复用同一个 pg Pool）。
export function createDbMiddleware() {
  return createMiddleware<AppEnv>(async (c, next) => {
    c.set("db", await getDb());
    await next();
  });
}
