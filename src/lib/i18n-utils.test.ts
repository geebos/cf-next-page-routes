import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";

import {
  getBaseUrl,
  getSiteUrl,
  localizePath,
  replacePathLocale,
  stripLocalePrefix,
} from "./i18n-utils";

describe("localizePath", () => {
  it("prefixes empty path with locale trailing slash", () => {
    assert.equal(localizePath("", "en"), "/en/");
  });

  it("prefixes path without locale", () => {
    assert.equal(localizePath("/todo", "zh-CN"), "/zh-CN/todo/");
  });

  it("replaces existing locale segment", () => {
    assert.equal(localizePath("/en/todo", "zh-CN"), "/zh-CN/todo/");
  });

  it("leaves external hrefs unchanged", () => {
    assert.equal(localizePath("https://x.com/a", "en"), "https://x.com/a");
    assert.equal(localizePath("mailto:a@b.c", "en"), "mailto:a@b.c");
    assert.equal(localizePath("#hash", "en"), "#hash");
  });

  it("preserves search and hash", () => {
    assert.equal(
      localizePath("/en/todo?x=1#h", "zh-CN"),
      "/zh-CN/todo/?x=1#h",
    );
  });
});

describe("stripLocalePrefix", () => {
  it("strips supported locale prefix", () => {
    assert.equal(stripLocalePrefix("/zh-CN/todo"), "/todo");
  });

  it("keeps path without locale", () => {
    assert.equal(stripLocalePrefix("/todo"), "/todo");
  });

  it("strips locale-only path to root", () => {
    assert.equal(stripLocalePrefix("/en"), "/");
    assert.equal(stripLocalePrefix("/en/"), "/");
  });

  it("leaves external hrefs unchanged", () => {
    assert.equal(stripLocalePrefix("https://x.com/a"), "https://x.com/a");
  });

  it("preserves search and hash", () => {
    assert.equal(stripLocalePrefix("/en/todo?x=1#h"), "/todo?x=1#h");
  });
});

describe("replacePathLocale", () => {
  it("matches localizePath", () => {
    assert.equal(
      replacePathLocale("/en/todo", "zh-CN"),
      localizePath("/en/todo", "zh-CN"),
    );
  });
});

describe("getBaseUrl / getSiteUrl", () => {
  let prevBase: string | undefined;
  let prevNodeEnv: string | undefined;

  function setNodeEnv(value: string | undefined) {
    Object.defineProperty(process.env, "NODE_ENV", {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  beforeEach(() => {
    prevBase = process.env.NEXT_PUBLIC_BASE_URL;
    prevNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (prevBase === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = prevBase;
    setNodeEnv(prevNodeEnv);
  });

  it("returns valid https base as-is", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://a.com";
    assert.equal(getBaseUrl(), "https://a.com");
  });

  it("returns valid http base with port", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "http://a.com:3000";
    assert.equal(getBaseUrl(), "http://a.com:3000");
  });

  it("trims whitespace", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "  https://a.com  ";
    assert.equal(getBaseUrl(), "https://a.com");
  });

  it("rejects path trailing slash and missing scheme", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://a.com/";
    assert.throws(() => getBaseUrl(), /Got/);
    process.env.NEXT_PUBLIC_BASE_URL = "https://a.com/path";
    assert.throws(() => getBaseUrl(), /Got/);
    process.env.NEXT_PUBLIC_BASE_URL = "a.com";
    assert.throws(() => getBaseUrl(), /Got/);
  });

  it("production unset throws", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    setNodeEnv("production");
    assert.throws(() => getBaseUrl(), /must be set/);
    assert.throws(() => getSiteUrl(), /must be set/);
  });

  it("dev unset returns empty base and example site", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    setNodeEnv("development");
    assert.equal(getBaseUrl(), "");
    assert.equal(getSiteUrl(), "https://example.com");
  });

  it("getSiteUrl returns base when set", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://a.com";
    assert.equal(getSiteUrl(), "https://a.com");
  });
});
