import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_DEPLOY_MODE,
  isAssetsStaticPath,
  isDeployMode,
  isMediaStaticPath,
  isNextAssetPath,
  MEDIA_STATIC_ENTRIES,
  NEXT_ASSET_DIR,
  NEXT_DATA_DIR,
  normalizeAssetsBaseUrl,
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

describe("normalizeAssetsBaseUrl", () => {
  it("trims whitespace and trailing slashes", () => {
    assert.equal(normalizeAssetsBaseUrl(undefined), "");
    assert.equal(normalizeAssetsBaseUrl("  "), "");
    assert.equal(
      normalizeAssetsBaseUrl(" https://cdn.example.com// "),
      "https://cdn.example.com",
    );
  });

  it("keeps an optional path prefix", () => {
    assert.equal(
      normalizeAssetsBaseUrl("https://cdn.example.com/static/"),
      "https://cdn.example.com/static",
    );
  });
});

describe("next asset whitelist", () => {
  it("accepts Next browser assets under _next", () => {
    assert.equal(isNextAssetPath(`/${NEXT_ASSET_DIR}/static/a1b2.js`), true);
    assert.equal(isNextAssetPath(`/${NEXT_ASSET_DIR}/static/chunks/x.css`), true);
    assert.equal(isNextAssetPath(`/${NEXT_ASSET_DIR}/buildId/_buildManifest.js`), true);
  });

  it("rejects _next/data, which stays same-origin with the pages", () => {
    assert.equal(isNextAssetPath(`/${NEXT_ASSET_DIR}/${NEXT_DATA_DIR}`), false);
    assert.equal(
      isNextAssetPath(`/${NEXT_ASSET_DIR}/${NEXT_DATA_DIR}/buildId/index.json`),
      false,
    );
    assert.equal(isAssetsStaticPath(`/${NEXT_ASSET_DIR}/${NEXT_DATA_DIR}/x.json`), false);
  });

  it("rejects paths outside _next", () => {
    assert.equal(isNextAssetPath("/"), false);
    assert.equal(isNextAssetPath(`/${NEXT_ASSET_DIR}`), false);
    assert.equal(isNextAssetPath(`/_nextish/static/a.js`), false);
    assert.equal(isNextAssetPath("/index.html"), false);
  });
});
