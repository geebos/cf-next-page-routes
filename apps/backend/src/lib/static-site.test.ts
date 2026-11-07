import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { Hono } from "hono";

import type { AppEnv } from "../types";
import { mountStaticSite } from "./static-site";

const root = mkdtempSync(join(tmpdir(), "static-site-"));
writeFileSync(join(root, "index.html"), "<h1>home</h1>");
writeFileSync(join(root, "404.html"), "<h1>missing</h1>");
writeFileSync(join(root, ".env"), "SECRET=1");
writeFileSync(join(root, "app.js.map"), "{}");

after(() => {
  rmSync(root, { recursive: true, force: true });
});

function createTestApp() {
  const app = new Hono<AppEnv>();
  app.get("/api/health", (c) => c.json({ ok: true }));
  mountStaticSite(app, root);
  return app;
}

describe("mountStaticSite", () => {
  it("redirects the default locale prefix to unprefixed routes", async () => {
    const app = createTestApp();

    const rootRes = await app.request("http://localhost/en");
    assert.equal(rootRes.status, 301);
    assert.equal(rootRes.headers.get("Location"), "/");

    const nestedRes = await app.request("http://localhost/en/todo/?x=1");
    assert.equal(nestedRes.status, 301);
    assert.equal(nestedRes.headers.get("Location"), "/todo/?x=1");
  });

  it("does not intercept api routes mounted before it", async () => {
    const res = await createTestApp().request("http://localhost/api/health");

    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  });

  it("serves exported pages and falls back to 404.html", async () => {
    const app = createTestApp();

    const home = await app.request("http://localhost/index.html");
    assert.equal(home.status, 200);
    assert.equal(await home.text(), "<h1>home</h1>");
    assert.equal(home.headers.get("Cache-Control"), "no-cache");

    const missing = await app.request("http://localhost/missing-page/");
    assert.equal(missing.status, 404);
    assert.equal(await missing.text(), "<h1>missing</h1>");
    assert.equal(missing.headers.get("X-Content-Type-Options"), "nosniff");
  });

  it("denies dotfiles and source maps even when present in the static root", async () => {
    const app = createTestApp();

    const env = await app.request("http://localhost/.env");
    assert.equal(env.status, 404);
    assert.equal(await env.text(), "<h1>missing</h1>");

    const map = await app.request("http://localhost/app.js.map");
    assert.equal(map.status, 404);
  });
});
