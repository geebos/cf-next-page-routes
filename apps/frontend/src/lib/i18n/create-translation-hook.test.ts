import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Namespace } from "i18next";
import { normalizeNamespaces } from "./create-translation-hook";

describe("normalizeNamespaces", () => {
  it("defaults to common", () => {
    assert.deepEqual(normalizeNamespaces(), ["common"]);
  });

  it("wraps a single namespace", () => {
    assert.deepEqual(normalizeNamespaces("admin"), ["admin"]);
  });

  it("keeps order and removes duplicates", () => {
    assert.deepEqual(
      normalizeNamespaces(["common", "todo", "common", "admin"]),
      ["common", "todo", "admin"],
    );
  });

  it("ignores empty values", () => {
    assert.deepEqual(
      normalizeNamespaces(["common", "", "todo"] as Namespace),
      ["common", "todo"],
    );
  });
});
