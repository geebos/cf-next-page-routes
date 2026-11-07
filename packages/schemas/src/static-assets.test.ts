import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_DEPLOY_MODE,
  isDeployMode,
  isMediaStaticPath,
  MEDIA_STATIC_ENTRIES,
  parseDeployMode,
} from "./static-assets";

describe("parseDeployMode", () => {
  it("defaults to both when unset or empty", () => {
    assert.equal(parseDeployMode(undefined), DEFAULT_DEPLOY_MODE);
    assert.equal(parseDeployMode(""), DEFAULT_DEPLOY_MODE);
    assert.equal(parseDeployMode("  "), DEFAULT_DEPLOY_MODE);
  });

  it("accepts every declared mode", () => {
    assert.equal(parseDeployMode("both"), "both");
    assert.equal(parseDeployMode("site"), "site");
    assert.equal(parseDeployMode("assets"), "assets");
  });

  it("rejects unknown values", () => {
    assert.throws(() => parseDeployMode("cdn"), /DEPLOY_MODE/);
    assert.equal(isDeployMode("cdn"), false);
  });
});

describe("media whitelist", () => {
  it("is empty until media entries are declared", () => {
    assert.deepEqual(MEDIA_STATIC_ENTRIES, []);
    assert.equal(isMediaStaticPath("/media/demo.mp4"), false);
    assert.equal(isMediaStaticPath("/"), false);
  });
});
