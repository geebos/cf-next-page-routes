import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseLocaleFilePath } from "./paths";

describe("parseLocaleFilePath", () => {
  it("maps namespace index files to the namespace container", () => {
    assert.deepEqual(parseLocaleFilePath("public/home/_home.yml"), {
      visibility: "public",
      namespace: "home",
      containerPath: ["home"],
    });
  });

  it("maps namespace-root files to namespace.file containers", () => {
    assert.deepEqual(parseLocaleFilePath("public/home/hero.yml"), {
      visibility: "public",
      namespace: "home",
      containerPath: ["home", "hero"],
    });
  });

  it("supports nested directories and coexisting file/dir stems", () => {
    assert.deepEqual(parseLocaleFilePath("public/demo/buttons.yml"), {
      visibility: "public",
      namespace: "demo",
      containerPath: ["demo", "buttons"],
    });
    assert.deepEqual(parseLocaleFilePath("public/demo/buttons/row.yml"), {
      visibility: "public",
      namespace: "demo",
      containerPath: ["demo", "buttons", "row"],
    });
  });

  it("parses private files", () => {
    assert.deepEqual(parseLocaleFilePath("private/admin/_admin.yml"), {
      visibility: "private",
      namespace: "admin",
      containerPath: ["admin"],
    });
  });

  it("rejects root locale files without a namespace", () => {
    assert.throws(
      () => parseLocaleFilePath("public/home.yml"),
      /must live inside a namespace directory/,
    );
  });

  it("rejects unknown visibility directories", () => {
    assert.throws(
      () => parseLocaleFilePath("shared/home/_home.yml"),
      /unknown visibility directory/,
    );
  });

  it("rejects namespace index files outside the namespace root", () => {
    assert.throws(
      () => parseLocaleFilePath("public/home/account/_account.yml"),
      /must be at the namespace root/,
    );
  });

  it("rejects namespace index files with a mismatched name", () => {
    assert.throws(
      () => parseLocaleFilePath("public/home/_hero.yml"),
      /must be named "_home.yml"/,
    );
  });

  it("rejects dotted file names", () => {
    assert.throws(
      () => parseLocaleFilePath("public/common/navigation.v2.yml"),
      /invalid file name/,
    );
  });

  it("rejects underscore-prefixed directories and namespaces", () => {
    assert.throws(
      () => parseLocaleFilePath("public/_home/hero.yml"),
      /invalid namespace/,
    );
    assert.throws(
      () => parseLocaleFilePath("public/home/_account/profile.yml"),
      /invalid directory/,
    );
  });

  it("rejects __proto__ segments", () => {
    assert.throws(
      () => parseLocaleFilePath("public/__proto__/hero.yml"),
      /invalid namespace/,
    );
    assert.throws(
      () => parseLocaleFilePath("public/home/__proto__.yml"),
      /must be named "_home\.yml"/,
    );
  });
});
