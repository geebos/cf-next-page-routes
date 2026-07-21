import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { pickLocale } from "./i18n-static";

describe("pickLocale", () => {
  it("picks string leaf for locale", () => {
    const node = { en: "Hello", "zh-CN": "你好" };
    assert.equal(pickLocale(node, "zh-CN"), "你好");
    assert.equal(pickLocale(node, "en"), "Hello");
  });

  it("falls back to DEFAULT_LOCALE then first supported", () => {
    assert.equal(pickLocale({ en: "Only EN" }, "zh-CN"), "Only EN");
    assert.equal(pickLocale({ "zh-CN": "仅中文" }, "en"), "仅中文");
  });

  it("recurses nested objects", () => {
    const node = {
      section: {
        label: { en: "L", "zh-CN": "标" },
      },
    };
    assert.deepEqual(pickLocale(node, "zh-CN"), {
      section: { label: "标" },
    });
  });

  it("maps arrays element-wise", () => {
    const node = [
      { en: "a", "zh-CN": "甲" },
      { en: "b", "zh-CN": "乙" },
    ];
    assert.deepEqual(pickLocale(node, "zh-CN"), ["甲", "乙"]);
  });

  it("does not treat mixed keys as leaf map", () => {
    const node = {
      en: "not-leaf",
      nested: { en: "inner" },
    };
    const picked = pickLocale(node, "en") as Record<string, unknown>;
    assert.equal(picked.en, "not-leaf");
    assert.equal(picked.nested, "inner");
  });

  it("passes through primitives", () => {
    assert.equal(pickLocale("raw", "en"), "raw");
    assert.equal(pickLocale(null, "en"), null);
  });

  it("keeps empty object nodes as empty objects", () => {
    assert.deepEqual(pickLocale({ empty: {} }, "en"), { empty: {} });
  });
});
