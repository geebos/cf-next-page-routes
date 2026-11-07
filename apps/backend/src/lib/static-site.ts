import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Context, Hono } from "hono";
import { compress } from "hono/compress";
import { serveStatic } from "@hono/node-server/serve-static";
import { DEFAULT_LOCALE } from "@repo/i18n";
import type { AppEnv } from "../types";

// 敏感文件与构建源映射即使误入 out/ 也不下发。
const DENY_PATTERN = /(?:^|\/)\.[^/]|\.map$/;

/**
 * Node 专用：把 Next.js 静态导出目录挂在 Hono app 后面，让单个进程同时提供
 * 静态站点与 /api/*。
 *
 * 必须在 createApp() 之后调用：Hono 的中间件只作用于其后注册的 handler，
 * /api/* 路由已先行返回，不受这里的压缩、缓存与 404 兜底影响。
 */
export function mountStaticSite(app: Hono<AppEnv>, root: string): void {
  const localePrefix = `/${DEFAULT_LOCALE}`;

  // 静态产物以文本为主（HTML/JS/CSS）。
  app.use("*", compress());

  // 旧默认语言前缀 → 无前缀，保留查询串。
  // 前缀取自构建期默认语言，与静态导出的无前缀路由同源，否则会互相重定向。
  app.use("*", async (c, next) => {
    const { pathname, search } = new URL(c.req.url);
    if (pathname === localePrefix || pathname.startsWith(`${localePrefix}/`)) {
      const target = pathname.slice(localePrefix.length) || "/";
      return c.redirect(`${target}${search}`, 301);
    }
    await next();
  });

  // 哈希产物长缓存、HTML 每次协商、安全响应头统一补齐。
  app.use("*", async (c, next) => {
    await next();
    if (c.res.status === 200) {
      if (c.req.path.startsWith("/_next/static/")) {
        c.res.headers.set(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
      } else if (
        c.res.headers.get("Content-Type")?.startsWith("text/html")
      ) {
        c.res.headers.set("Cache-Control", "no-cache");
      }
    }
    c.res.headers.set("X-Content-Type-Options", "nosniff");
    c.res.headers.set("X-Frame-Options", "SAMEORIGIN");
    c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  });

  app.use("*", async (c, next) => {
    if (DENY_PATTERN.test(c.req.path)) return renderNotFound(c, root);
    await next();
  });

  app.use("*", serveStatic({ root }));

  // 静态文件未命中：/api/* 交给 createApp() 的 404，其余返回导出的 404 页。
  app.all("*", (c) => {
    if (c.req.path === "/api" || c.req.path.startsWith("/api/")) {
      return c.notFound();
    }
    return renderNotFound(c, root);
  });
}

function renderNotFound(c: Context<AppEnv>, root: string) {
  const page = join(root, "404.html");
  return existsSync(page)
    ? c.html(readFileSync(page, "utf8"), 404)
    : c.text("Not Found", 404);
}
