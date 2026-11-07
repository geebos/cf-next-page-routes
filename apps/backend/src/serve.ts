import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { serve } from "@hono/node-server";
import type { Hono } from "hono";
import { parseDeployMode, type DeployMode } from "@repo/schemas";
import { createApp } from "./index";
import { getDb } from "./db/client";
import { createAssetsApp } from "./lib/static-assets";
import { mountStaticSite } from "./lib/static-site";
import type { AppEnv } from "./types";

// Node 运行时入口（@hono/node-server）。
// - 默认只跑 API；带 STATIC_ROOT 时同一个进程同时提供静态站点与 /api/*。
// - DEPLOY_MODE=assets 时只提供公共媒体，不初始化 PostgreSQL。
const port = Number(process.env.PORT) || 8787;

// 非法值直接退出：部署模式决定这个进程对外提供什么，猜一个默认值比启动失败更危险。
function readDeployMode(): DeployMode {
  try {
    return parseDeployMode(process.env.DEPLOY_MODE);
  } catch (error) {
    console.error(
      `[backend] ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

async function createSiteApp(staticRoot: string): Promise<Hono<AppEnv>> {
  // 预热连接，使初始化失败在 listen 前暴露，而非首个请求才 500。
  await getDb();
  const app = createApp();
  if (staticRoot) mountStaticSite(app, staticRoot);
  return app;
}

async function main() {
  const mode = readDeployMode();

  // STATIC_ROOT 指向该部署模式的静态根（构建脚本按 DEPLOY_MODE 裁好）。
  const staticRoot = process.env.STATIC_ROOT
    ? resolve(process.env.STATIC_ROOT)
    : "";
  if (staticRoot && !existsSync(staticRoot)) {
    console.error(
      `[backend] STATIC_ROOT "${staticRoot}" does not exist, run pnpm build first`,
    );
    process.exit(1);
  }
  if (mode === "assets" && !staticRoot) {
    console.error(
      "[backend] DEPLOY_MODE=assets needs STATIC_ROOT pointing at the media artifact",
    );
    process.exit(1);
  }

  let app: Hono<AppEnv>;
  if (mode === "assets") {
    app = createAssetsApp(staticRoot);
  } else {
    app = await createSiteApp(staticRoot);
  }

  serve(
    {
      fetch: (request) => app.fetch(request),
      port,
      hostname: process.env.HOST || "127.0.0.1",
    },
    (info) => {
      console.log(
        `[backend] DEPLOY_MODE=${mode} listening on http://localhost:${info.port} ` +
          (staticRoot ? `static=${staticRoot}` : "api-only"),
      );
    },
  );
}

main().catch((error) => {
  console.error("[backend] failed to start", error);
  process.exit(1);
});
