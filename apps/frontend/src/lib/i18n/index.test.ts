import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ApiError } from "../api";
import { I18nAccessError, mapPrivateLocaleError } from "./index";

describe("mapPrivateLocaleError", () => {
  it("maps 401 to I18nAccessError", () => {
    const mapped = mapPrivateLocaleError(new ApiError("no session", 401), "admin");

    assert.ok(mapped instanceof I18nAccessError);
    assert.equal(mapped.namespace, "admin");
    assert.equal(mapped.status, 401);
  });

  it("maps 403 to I18nAccessError", () => {
    const mapped = mapPrivateLocaleError(new ApiError("forbidden", 403), "admin");

    assert.ok(mapped instanceof I18nAccessError);
    assert.equal(mapped.status, 403);
  });

  it("keeps other API errors as regular errors", () => {
    const error = new ApiError("server error", 500);
    const mapped = mapPrivateLocaleError(error, "admin");

    assert.equal(mapped, error);
    assert.equal(mapped instanceof I18nAccessError, false);
  });

  it("keeps network errors as regular errors", () => {
    const error = new Error("network down");
    assert.equal(mapPrivateLocaleError(error, "admin"), error);
  });
});
