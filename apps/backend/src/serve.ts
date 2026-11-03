import { serve } from "@hono/node-server";
import { createApp } from "./index";
import { getDb } from "./db/client";

// Node 运行时入口（@hono/node-server）。
// DB 后端固定为 PostgreSQL：连接串来自 POSTGRES_URL。
// 启动方式：POSTGRES_URL=postgres://... pnpm dev:worker
const port = Number(process.env.PORT) || 8787;

async function main() {
  // 预热连接，使初始化失败在 listen 前暴露，而非首个请求才 500。
  await getDb();

  serve({ fetch: createApp().fetch, port }, (info) => {
    console.log(`[worker] listening on http://localhost:${info.port} (postgres)`);
  });
}

main().catch((err) => {
  console.error("[worker] failed to start", err);
  process.exit(1);
});
