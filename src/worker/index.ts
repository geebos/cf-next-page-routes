import { Hono } from "hono";
import { logger } from "hono/logger";
import type { D1Database } from "@cloudflare/workers-types";
import { healthRoute } from "./routes/health";
import { helloRoute } from "./routes/hello";

type Bindings = {
  DB: D1Database;
  APP_ENV: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());

app.route("/api", healthRoute);
app.route("/api", helloRoute);

app.onError((err, c) => {
  console.error(`${c.req.method} ${c.req.url}`, err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
