import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { schema } from "@repo/db";

// PostgreSQL 连接层 —— 本项目唯一的 DB 后端。
// 需要换成其他数据库时，整体替换本文件、db/todos.ts 与 packages/db（表定义、
// 迁移、drizzle 配置），而不是并行维护多套实现。
//
// POSTGRES_URL 是唯一配置来源；pg / drizzle 用动态 import，避免把原生驱动
// 与 Node 网络模块静态带进 Worker 打包路径。
export type AppDB = NodePgDatabase<typeof schema>;

let db: AppDB | null = null;
let init: Promise<AppDB> | null = null;

// 创建并缓存 pg Pool + drizzle 实例。
// 失败时清空 in-flight promise，允许后续请求重试。
export async function getDb(): Promise<AppDB> {
  if (db) return db;
  if (!init) {
    const start = (async () => {
      const connectionString = process.env.POSTGRES_URL?.trim();
      if (!connectionString) {
        throw new Error(
          "POSTGRES_URL 未设置：需要 PostgreSQL 连接字符串",
        );
      }

      const [{ Pool }, { drizzle: drizzlePostgres }] = await Promise.all([
        import("pg"),
        import("drizzle-orm/node-postgres"),
      ]);
      const pool = new Pool({ connectionString });

      try {
        // 预热连接，使连接失败在启动/首个请求时显式暴露。
        await pool.query("select 1");
        const instance = drizzlePostgres(pool, { schema });
        db = instance;
        return instance;
      } catch (error) {
        await pool.end().catch(() => undefined);
        throw error;
      }
    })();

    init = start.catch((error) => {
      init = null;
      throw error;
    });
  }
  return init;
}
