import { serve } from "@hono/node-server";
import { createApp } from "./index";
import { getEngine, getSqliteDb } from "./db/engine";

// Node 运行时入口（@hono/node-server）。
// 用于 DB_ENGINE=sqlite（本地文件 SQLite / better-sqlite3）场景，例如 Tauri/桌面后端。
// 启动方式：DB_ENGINE=sqlite DB_SQLITE_DIR=./.sqlite pnpm dev:worker:sqlite
// getEngine() 是唯一真相源（未设 env 时为 d1）；本入口不支持 d1，亦不静默改写默认引擎。
const port = Number(process.env.PORT) || 8787;

async function main() {
  const engine = getEngine();

  if (engine === "d1") {
    console.error(
      "[worker] Node serve 不支持 DB_ENGINE=d1（或未设置）。请用 wrangler dev，或设置 DB_ENGINE=sqlite 与 DB_SQLITE_DIR 后重试。",
    );
    process.exit(1);
  }

  if (!process.env.DB_SQLITE_DIR) {
    console.error(
      "[worker] DB_ENGINE=sqlite 需要设置 DB_SQLITE_DIR（sqlite 数据文件目录）。",
    );
    process.exit(1);
  }

  // 预热 open+migrate，使迁移失败在 listen 前表面，而非首个请求才 500。
  await getSqliteDb();

  serve({ fetch: createApp().fetch, port }, (info) => {
    console.log(
      `[worker] listening on http://localhost:${info.port} (engine=${engine})`,
    );
  });
}

main().catch((err) => {
  console.error("[worker] failed to start", err);
  process.exit(1);
});
