import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";

import { createAssetsApp } from "./static-assets";

const root = mkdtempSync(join(tmpdir(), "static-assets-"));
const nextStatic = join(root, "_next", "static", "chunks");
const nextData = join(root, "_next", "data", "buildId");
mkdirSync(nextStatic, { recursive: true });
mkdirSync(nextData, { recursive: true });
writeFileSync(join(root, "leak.txt"), "should not be served");
writeFileSync(join(nextStatic, "a1b2.js"), "console.log(1)");
writeFileSync(join(nextData, "index.json"), "{}");

after(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("createAssetsApp", () => {
  it("rejects paths outside the whitelist", async () => {
    const app = createAssetsApp(root);

    for (const path of ["/", "/leak.txt", "/media/demo.mp4", "/.env"]) {
      const res = await app.request(`http://localhost${path}`);
      assert.equal(res.status, 404, path);
      assert.deepEqual(await res.json(), { code: 404, message: "not_found" });
    }
  });

  it("serves Next browser assets with an immutable cache", async () => {
    const app = createAssetsApp(root);

    const res = await app.request("http://localhost/_next/static/chunks/a1b2.js");
    assert.equal(res.status, 200);
    assert.equal(await res.text(), "console.log(1)");
    assert.equal(
      res.headers.get("Cache-Control"),
      "public, max-age=31536000, immutable",
    );
  });

  it("never serves _next/data, which belongs to the site origin", async () => {
    const app = createAssetsApp(root);

    const res = await app.request(
      "http://localhost/_next/data/buildId/index.json",
    );
    assert.equal(res.status, 404);
  });
});
