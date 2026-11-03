import { Hono } from "hono";
import { logger } from "hono/logger";
import type { AppEnv } from "./types";
import { healthRoute } from "./routes/health";
import { helloRoute } from "./routes/hello";
import { createI18nRoute } from "./routes/i18n";
import { todosRoute } from "./routes/todos";
import { createErrorHandler } from "./middleware/error";
import { createDbMiddleware } from "./middleware/db";
import type { AuthResolver } from "./middleware/auth";

export type CreateAppOptions = {
  getAuthFromRequest?: AuthResolver;
};

// 构建 Hono app。Node 入口（serve.ts）与 Worker 部署入口（默认导出）共用此构造，
// 保证两条运行时路径挂载的中间件/路由完全一致。
export function createApp(options: CreateAppOptions = {}) {
  // 默认拒绝：未配置真实 auth resolver 时，私有 locale 一律 401。
  const getAuthFromRequest: AuthResolver =
    options.getAuthFromRequest ?? (async () => null);
  const app = new Hono<AppEnv>();

  app.use("*", logger());
  app.use("*", createDbMiddleware());

  app.route("/api", healthRoute);
  app.route("/api", helloRoute);
  app.route("/api", createI18nRoute(getAuthFromRequest));
  app.route("/api", todosRoute);

  app.onError(createErrorHandler<AppEnv>());

  return app;
}

// Worker 部署入口（wrangler）；DB 通过 POSTGRES_URL 连接 PostgreSQL。
export default createApp();
