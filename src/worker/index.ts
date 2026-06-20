import { Hono } from "hono";
import { logger } from "hono/logger";
import type { AppEnv } from "@/worker/types";
import { healthRoute } from "./routes/health";
import { helloRoute } from "./routes/hello";
import { createErrorHandler } from "./middleware/error";
import { createDbMiddleware } from "./middleware/db";

const app = new Hono<AppEnv>();

app.use("*", logger());
app.use("*", createDbMiddleware());

app.route("/api", healthRoute);
app.route("/api", helloRoute);

app.onError(createErrorHandler<AppEnv>());

export default app;
