import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { isAssetsStaticPath } from "@repo/schemas";
import type { Context } from "hono";
import type { AppEnv } from "../types";

// 公共媒体不随内容改名，缓存 7 天。
const MEDIA_MAX_AGE = "public, max-age=604800";
// Next 的浏览器产物文件名带哈希，可以永久缓存（与站点进程同策略）。
const NEXT_STATIC_MAX_AGE = "public, max-age=31536000, immutable";

/**
 * Node 专用：DEPLOY_MODE=assets 的进程只提供公共媒体与 Next 浏览器产物。
 *
 * 不挂 `/api/*`、不渲染站点 404 页、也不读数据库：资源域名上多暴露一条路由
 * 都是多余的攻击面。白名单之外的路径（含 `_next/data/` 与页面）一律 404 JSON，
 * 因此即使静态根里混进了页面或私有素材也不会被发出去。
 */
export function createAssetsApp(root: string): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    if (!isAssetsStaticPath(c.req.path)) return notFound(c);
    await next();
  });

  app.use("*", async (c, next) => {
    await next();
    if (c.res.status === 200) {
      c.res.headers.set(
        "Cache-Control",
        c.req.path.startsWith("/_next/static/")
          ? NEXT_STATIC_MAX_AGE
          : MEDIA_MAX_AGE,
      );
    }
    c.res.headers.set("X-Content-Type-Options", "nosniff");
  });

  app.use("*", serveStatic({ root }));

  app.notFound(notFound);

  return app;
}

function notFound(c: Context<AppEnv>) {
  return c.json({ code: 404, message: "not_found" }, 404);
}
