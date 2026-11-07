import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";

import { createAssetsApp } from "./static-assets";

const root = mkdtempSync(join(tmpdir(), "static-assets-"));
writeFileSync(join(root, "leak.txt"), "should not be served");

after(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("createAssetsApp", () => {
  it("rejects every path while the media whitelist is empty", async () => {
    const app = createAssetsApp(root);

    for (const path of ["/", "/leak.txt", "/media/demo.mp4", "/.env"]) {
      const res = await app.request(`http://localhost${path}`);
      assert.equal(res.status, 404, path);
      assert.deepEqual(await res.json(), { code: 404, message: "not_found" });
    }
  });
});
