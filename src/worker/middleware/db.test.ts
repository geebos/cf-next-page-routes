import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { Hono } from "hono";
import type { AppEnv } from "../types";
import { createDbMiddleware } from "./db";

type SessionStub = {
  getBookmark: () => string | null;
};

function buildApp(opts: {
  getBookmark: () => string | null;
  withSessionCalls: string[];
}) {
  const session: SessionStub = {
    getBookmark: opts.getBookmark,
  };

  const app = new Hono<AppEnv>();
  app.use("*", createDbMiddleware());
  app.get("/api/health", (c) => c.json({ ok: true }));

  // Minimal D1 binding stub — only withSession is exercised by the middleware.
  const env = {
    DB: {
      withSession(bookmark: string) {
        opts.withSessionCalls.push(bookmark);
        return session;
      },
    },
    APP_ENV: "test",
  } as unknown as AppEnv["Bindings"];

  return { app, env };
}

function setCookieHeaders(res: Response): string[] {
  // undici / node may expose getSetCookie; fall back to raw header.
  const anyHeaders = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

function d1BmCookies(res: Response): string[] {
  return setCookieHeaders(res).filter((h) => /(^|,\s*)d1_bm=/i.test(h) || h.startsWith("d1_bm="));
}

describe("createDbMiddleware bookmark cookie", () => {
  let prevEngine: string | undefined;

  beforeEach(() => {
    prevEngine = process.env.DB_ENGINE;
    // Force d1 path (default when unset / non-sqlite).
    delete process.env.DB_ENGINE;
  });

  afterEach(() => {
    if (prevEngine === undefined) delete process.env.DB_ENGINE;
    else process.env.DB_ENGINE = prevEngine;
  });

  it("U1: missing cookie → withSession(first-unconstrained)", async () => {
    const withSessionCalls: string[] = [];
    const { app, env } = buildApp({
      getBookmark: () => null,
      withSessionCalls,
    });

    await app.request("http://localhost:8787/api/health", {}, env);

    assert.deepEqual(withSessionCalls, ["first-unconstrained"]);
  });

  it("U2: empty cookie d1_bm= → withSession(first-unconstrained)", async () => {
    const withSessionCalls: string[] = [];
    const { app, env } = buildApp({
      getBookmark: () => null,
      withSessionCalls,
    });

    await app.request(
      "http://localhost:8787/api/health",
      { headers: { Cookie: "d1_bm=" } },
      env,
    );

    assert.deepEqual(withSessionCalls, ["first-unconstrained"]);
  });

  it("U3: valid inbound + null getBookmark → no empty Set-Cookie, no delete", async () => {
    const withSessionCalls: string[] = [];
    const { app, env } = buildApp({
      getBookmark: () => null,
      withSessionCalls,
    });

    const res = await app.request(
      "http://localhost:8787/api/health",
      { headers: { Cookie: "d1_bm=tok" } },
      env,
    );

    assert.deepEqual(withSessionCalls, ["tok"]);
    const cookies = d1BmCookies(res);
    assert.equal(cookies.length, 0, `expected no d1_bm Set-Cookie, got: ${cookies.join(" | ")}`);
  });

  it("U4: dirty empty inbound + null getBookmark → deleteCookie (Max-Age=0)", async () => {
    const withSessionCalls: string[] = [];
    const { app, env } = buildApp({
      getBookmark: () => null,
      withSessionCalls,
    });

    const res = await app.request(
      "http://localhost:8787/api/health",
      { headers: { Cookie: "d1_bm=" } },
      env,
    );

    const cookies = d1BmCookies(res);
    assert.ok(cookies.length >= 1, "expected delete Set-Cookie for dirty empty");
    const joined = cookies.join("; ");
    // hono deleteCookie sets value "" and maxAge: 0
    assert.match(joined, /d1_bm=/i);
    assert.match(joined, /Max-Age=0/i);
  });

  it("U5: missing cookie + getBookmark advances → Set-Cookie without Secure on http", async () => {
    const withSessionCalls: string[] = [];
    const { app, env } = buildApp({
      getBookmark: () => "new",
      withSessionCalls,
    });

    const res = await app.request("http://localhost:8787/api/health", {}, env);

    const cookies = d1BmCookies(res);
    assert.equal(cookies.length, 1);
    assert.match(cookies[0]!, /d1_bm=new/);
    assert.doesNotMatch(cookies[0]!, /;\s*Secure/i);
  });

  it("U6: missing cookie + getBookmark advances → Set-Cookie with Secure on https", async () => {
    const withSessionCalls: string[] = [];
    const { app, env } = buildApp({
      getBookmark: () => "new",
      withSessionCalls,
    });

    const res = await app.request("https://example.com/api/health", {}, env);

    const cookies = d1BmCookies(res);
    assert.equal(cookies.length, 1);
    assert.match(cookies[0]!, /d1_bm=new/);
    assert.match(cookies[0]!, /;\s*Secure/i);
  });

  it("U7: inbound equals getBookmark → omit Set-Cookie", async () => {
    const { app, env } = buildApp({
      getBookmark: () => "tok",
      withSessionCalls: [],
    });

    const res = await app.request(
      "http://localhost:8787/api/health",
      { headers: { Cookie: "d1_bm=tok" } },
      env,
    );

    assert.equal(d1BmCookies(res).length, 0);
  });

  it("U8: inbound advances to new bookmark → Set-Cookie tok2", async () => {
    const { app, env } = buildApp({
      getBookmark: () => "tok2",
      withSessionCalls: [],
    });

    const res = await app.request(
      "http://localhost:8787/api/health",
      { headers: { Cookie: "d1_bm=tok" } },
      env,
    );

    const cookies = d1BmCookies(res);
    assert.equal(cookies.length, 1);
    assert.match(cookies[0]!, /d1_bm=tok2/);
  });

  it("forged x-forwarded-proto does not flip Secure on https URL", async () => {
    const { app, env } = buildApp({
      getBookmark: () => "new",
      withSessionCalls: [],
    });

    const res = await app.request(
      "https://example.com/api/health",
      { headers: { "x-forwarded-proto": "http" } },
      env,
    );

    const cookies = d1BmCookies(res);
    assert.equal(cookies.length, 1);
    assert.match(cookies[0]!, /;\s*Secure/i);
  });
});
