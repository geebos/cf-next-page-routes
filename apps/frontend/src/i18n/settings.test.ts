import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  resolveAppLocale,
  SUPPORTED_LOCALES,
} from "./settings";

describe("isSupportedLocale", () => {
  it("accepts en and zh-CN", () => {
    assert.equal(isSupportedLocale("en"), true);
    assert.equal(isSupportedLocale("zh-CN"), true);
  });

  it("rejects bare zh and non-strings", () => {
    assert.equal(isSupportedLocale("zh"), false);
    assert.equal(isSupportedLocale(null), false);
    assert.equal(isSupportedLocale(1), false);
  });
});

describe("normalizeLocale", () => {
  it("returns supported locales as-is", () => {
    assert.equal(normalizeLocale("en"), "en");
    assert.equal(normalizeLocale("zh-CN"), "zh-CN");
  });

  it("maps language prefix zh to zh-CN", () => {
    assert.equal(normalizeLocale("zh"), "zh-CN");
    assert.equal(normalizeLocale("zh-TW"), "zh-CN");
  });

  it("falls back to DEFAULT_LOCALE", () => {
    assert.equal(normalizeLocale(null), DEFAULT_LOCALE);
    assert.equal(normalizeLocale(undefined), DEFAULT_LOCALE);
    assert.equal(normalizeLocale("xx-YY"), DEFAULT_LOCALE);
  });

  it("SUPPORTED_LOCALES matches en then zh-CN", () => {
    assert.deepEqual([...SUPPORTED_LOCALES], ["en", "zh-CN"]);
  });
});

describe("resolveAppLocale", () => {
  it("accepts exact supported locales", () => {
    assert.equal(resolveAppLocale("en"), "en");
    assert.equal(resolveAppLocale("zh-CN"), "zh-CN");
  });

  it("does not fuzzy-map language prefixes", () => {
    assert.equal(resolveAppLocale("zh"), DEFAULT_LOCALE);
  });

  it("falls back for missing unsupported and non-string", () => {
    assert.equal(resolveAppLocale(undefined), DEFAULT_LOCALE);
    assert.equal(resolveAppLocale(null), DEFAULT_LOCALE);
    assert.equal(resolveAppLocale("xx"), DEFAULT_LOCALE);
    assert.equal(resolveAppLocale(1), DEFAULT_LOCALE);
    assert.equal(resolveAppLocale({}), DEFAULT_LOCALE);
    assert.equal(resolveAppLocale(["en"]), DEFAULT_LOCALE);
  });
});
