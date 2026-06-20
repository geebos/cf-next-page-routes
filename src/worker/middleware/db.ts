import { createMiddleware } from "hono/factory";
import { getCookie, setCookie } from "hono/cookie";
import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import type { AppEnv } from "../types";
import * as schema from "../db/schema";

// D1 session bookmark cookie 名。
// 用 withSession(bookmark) 让同一 bookmark 窗口内的写操作对后续读可见，
// 实现请求级 read-your-writes；bookmark 随响应写回 cookie 供下次请求续用。
const BOOKMARK_COOKIE = "d1_bm";
const DEFAULT_BOOKMARK = "first-unconstrained";

export function createDbMiddleware() {
  return createMiddleware<AppEnv>(async (c, next) => {
    const bookmark = getCookie(c, BOOKMARK_COOKIE) ?? DEFAULT_BOOKMARK;
    const session = c.env.DB.withSession(bookmark);
    const db = drizzle(session as unknown as D1Database, { schema });

    c.set("db", db as AppEnv["Variables"]["db"]);

    await next();

    setCookie(c, BOOKMARK_COOKIE, session.getBookmark() ?? "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
  });
}
