import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isActive } from "./navigate";

describe("isActive", () => {
  it("matches root with optional trailing slash and locale", () => {
    assert.equal(isActive("/en/", "/"), true);
    assert.equal(isActive("/zh-CN/", "/"), true);
  });

  it("ignores trailing slashes on path and href", () => {
    assert.equal(isActive("/en/todo", "/todo/"), true);
    assert.equal(isActive("/en/todo/", "/todo/"), true);
    assert.equal(isActive("/en/todo/", "/todo"), true);
  });

  it("strips locale prefix before compare", () => {
    assert.equal(isActive("/zh-CN/todo/", "/todo/"), true);
    assert.equal(isActive("/en/test/", "/test/"), true);
  });

  it("uses pathname only (query ignored)", () => {
    assert.equal(isActive("/en/todo/?x=1", "/todo/"), true);
  });

  it("rejects different routes", () => {
    assert.equal(isActive("/en/todo/", "/"), false);
    assert.equal(isActive("/en/test/", "/todo/"), false);
  });
});
