import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Hono } from "hono";

import {
  DEFAULT_LOCALE,
  type Messages,
} from "@repo/i18n";
import { PRIVATE_RESOURCES } from "@repo/i18n/generated/private";
import type { AuthResolver } from "../middleware/auth";
import type { AppEnv } from "../types";
import { createI18nRoute } from "./i18n";

const ANONYMOUS: AuthResolver = async () => null;
const AUTHENTICATED: AuthResolver = async () => ({ id: "test-user" });

function buildApp(resolver: AuthResolver) {
  const app = new Hono<AppEnv>();
  app.route("/api", createI18nRoute(resolver));
  return app;
}

function get(path: string, resolver: AuthResolver = AUTHENTICATED) {
  return buildApp(resolver).request(`http://localhost${path}`);
}

describe("i18n route auth", () => {
  it("returns 401 when the resolver rejects the request", async () => {
    const res = await get("/api/i18n/en/admin", ANONYMOUS);

    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), {
      code: 401,
      message: "未登录或会话已过期",
      data: null,
    });
  });

  it("returns 401 by default when no resolver is configured", async () => {
    const app = new Hono<AppEnv>();
    app.route("/api", createI18nRoute(async () => null));
    const res = await app.request("http://localhost/api/i18n/en/admin");

    assert.equal(res.status, 401);
  });
});

describe("i18n route responses", () => {
  it("returns private messages with no-store caching for an authenticated user", async () => {
    const res = await get("/api/i18n/en/admin");

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Cache-Control"), "private, no-store");
    assert.deepEqual(await res.json(), PRIVATE_RESOURCES.en.admin);
  });

  it("falls back to the default locale when the namespace is missing", async () => {
    const res = await get("/api/i18n/zh-CN/admin");

    assert.equal(res.status, 200);
    assert.deepEqual(
      await res.json(),
      PRIVATE_RESOURCES[DEFAULT_LOCALE].admin as Messages,
    );
  });

  it("rejects unsupported locales and invalid namespaces", async () => {
    for (const path of [
      "/api/i18n/zh/admin",
      "/api/i18n/en/bad.name",
      "/api/i18n/en/bad:name",
    ]) {
      const res = await get(path);
      assert.equal(res.status, 400, path);
      assert.deepEqual(await res.json(), {
        code: 400,
        message: "Invalid locale or namespace",
        data: null,
      });
    }
  });

  it("returns 404 for public and unknown namespaces", async () => {
    for (const path of ["/api/i18n/en/common", "/api/i18n/en/unknown"]) {
      const res = await get(path);
      assert.equal(res.status, 404, path);
      assert.deepEqual(await res.json(), {
        code: 404,
        message: "Locale namespace not found",
        data: null,
      });
    }
  });
});
