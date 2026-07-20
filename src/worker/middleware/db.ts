import { createMiddleware } from "hono/factory";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import type { AppEnv } from "../types";
import { getEngine, getSqliteDb, createD1Db } from "../db/engine";

// D1 session bookmark cookie 名。
// 用 withSession(bookmark) 让同一 bookmark 窗口内的写操作对后续读可见，
// 实现请求级 read-your-writes；bookmark 随响应写回 cookie 供下次请求续用。
const BOOKMARK_COOKIE = "d1_bm";
const DEFAULT_BOOKMARK = "first-unconstrained";

// secure 唯一来源：请求 URL protocol。不用 x-forwarded-proto / NODE_ENV。
function cookieOptions(c: Context) {
  const isHttps = new URL(c.req.url).protocol === "https:";
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60,
  };
}

export function createDbMiddleware() {
  return createMiddleware<AppEnv>(async (c, next) => {
    // sqlite 引擎：单写者文件库天然 read-your-writes，复用进程级连接，无需 bookmark。
    if (getEngine() === "sqlite") {
      c.set("db", await getSqliteDb());
      await next();
      return;
    }

    // d1 引擎：保留会话级 read-your-writes（bookmark cookie）。
    // missing 与空串统一回退 first-unconstrained，避免 withSession("")。
    const inbound = getCookie(c, BOOKMARK_COOKIE) ?? "";
    const bookmark = inbound || DEFAULT_BOOKMARK;
    const session = c.env.DB.withSession(bookmark);
    const db = createD1Db(session);

    c.set("db", db as AppEnv["Variables"]["db"]);

    await next();

    // Write policy:
    // - next 非空且相对 inbound 推进 → setCookie
    // - next 空且 inbound 是脏空串 → deleteCookie 迁移
    // - 其余（含有效 inbound + null getBookmark、next === inbound）→ 不写 Set-Cookie
    const nextBookmark = session.getBookmark();
    if (nextBookmark && nextBookmark !== inbound) {
      setCookie(c, BOOKMARK_COOKIE, nextBookmark, cookieOptions(c));
    } else if (!nextBookmark && inbound === "") {
      deleteCookie(c, BOOKMARK_COOKIE, { path: "/" });
    }
  });
}
