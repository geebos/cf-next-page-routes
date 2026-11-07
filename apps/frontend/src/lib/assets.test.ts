import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ASSETS_BASE_URL, assetUrl } from "./assets";

describe("assetUrl", () => {
  it("returns same-origin paths when no assets domain is configured", () => {
    assert.equal(ASSETS_BASE_URL, "");
    assert.equal(assetUrl("/media/demo.mp4"), "/media/demo.mp4");
    assert.equal(assetUrl("media/demo.mp4"), "media/demo.mp4");
  });
});
