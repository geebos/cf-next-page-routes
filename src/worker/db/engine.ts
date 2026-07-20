import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import type { AnyD1Database, DrizzleD1Database } from "drizzle-orm/d1";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/schemas";

// 数据库引擎切换。
// - DB_ENGINE=d1（默认）：Cloudflare D1，经 wrangler 注入的 D1Database 绑定访问，
//   会话级 read-your-writes 由 db.ts 中间件用 D1 bookmark cookie 实现。
// - DB_ENGINE=sqlite：本地文件 SQLite（better-sqlite3），用于 Node 运行时
//   （@hono/node-server，如 Tauri/桌面后端）。单写者已天然 read-your-writes，
//   不需要 bookmark；DB_SQLITE_DIR 指定数据文件目录。
export type DbEngine = "d1" | "sqlite";

const SQLITE_FILE = "app.db";

export function getEngine(): DbEngine {
  return process.env.DB_ENGINE === "sqlite" ? "sqlite" : "d1";
}

// 进程级缓存的 better-sqlite3 drizzle 实例。
// Node 运行时全局复用一条连接；migrate 在首次创建时执行一次。
// 不变量：sqliteDb !== null ⇒ open + migrate（及 pragma 尝试）均已成功。
let sqliteDb: BetterSQLite3Database<typeof schema> | null = null;
// 并发首次调用共享同一 in-flight promise；失败后清 null 以便重试。
let sqliteInit: Promise<BetterSQLite3Database<typeof schema>> | null = null;

// 创建并缓存 sqlite 引擎的 drizzle 实例。
// better-sqlite3 / node:fs / node:path 用动态 import，确保 d1（CF Workers）
// 打包路径不会引入原生模块与 Node 文件系统 API。
export async function getSqliteDb(): Promise<BetterSQLite3Database<typeof schema>> {
  if (sqliteDb) return sqliteDb;
  if (!sqliteInit) {
    sqliteInit = (async () => {
      let conn: import("better-sqlite3").Database | undefined;
      try {
        const dir = process.env.DB_SQLITE_DIR;
        if (!dir) {
          throw new Error("DB_SQLITE_DIR 未设置：sqlite 引擎需要指定数据文件目录");
        }
        const fs = await import("node:fs");
        const path = await import("node:path");
        fs.mkdirSync(dir, { recursive: true });

        const Database = (await import("better-sqlite3")).default;
        conn = new Database(path.join(dir, SQLITE_FILE));

        // busy_timeout 始终设置；WAL 为 local disk 推荐，失败则 warn 并保留默认 journal。
        conn.pragma("busy_timeout = 5000");
        try {
          conn.pragma("journal_mode = WAL");
        } catch (e) {
          console.warn("[sqlite] WAL unavailable, keeping default journal_mode", e);
        }

        const db = drizzle(conn, { schema });
        // DB_MIGRATIONS_DIR（绝对或相对 cwd）> cwd/drizzle。不用 import.meta.url，避免 bundle 错位。
        const migrationsFolder = process.env.DB_MIGRATIONS_DIR
          ? path.resolve(process.env.DB_MIGRATIONS_DIR)
          : path.join(process.cwd(), "drizzle");
        migrate(db, { migrationsFolder });

        // 仅在 open + migrate 成功后赋值，保证 sqliteDb !== null ⇒ 已就绪。
        sqliteDb = db;
        return db;
      } catch (e) {
        try {
          conn?.close();
        } catch {
          // ignore close errors
        }
        sqliteInit = null; // required: allow later retry
        throw e;
      }
    })();
  }
  return sqliteInit;
}

// 为 d1 引擎从绑定创建 drizzle 实例（带会话的 session 由 db.ts 中间件传入）。
// AnyD1Database 是 drizzle d1 driver 接受的客户端类型，含 D1Database 与 D1DatabaseSession。
export function createD1Db(session: AnyD1Database): DrizzleD1Database<typeof schema> {
  return drizzleD1(session, { schema });
}

// 统一抽取「受影响行数」。
// D1 的 run 结果在 result.meta.changes；better-sqlite3 的 RunResult 直接是 result.changes。
export function affectedRows(result: unknown): number {
  const r = result as { meta?: { changes?: number }; changes?: number };
  return r?.meta?.changes ?? r?.changes ?? 0;
}
