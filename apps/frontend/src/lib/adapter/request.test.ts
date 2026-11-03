import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { request } from "./request";

/** Mirrors request.ts hasNoBodyStatus — Response forbids body on these statuses. */
function hasNoBodyStatus(status: number): boolean {
  return status === 204 || status === 304;
}

describe("request (Tauri proxy adapter)", () => {
  it("throws outside Tauri", async () => {
    await assert.rejects(
      () => request("https://example.com"),
      /only available in the Tauri environment/,
    );
  });
});

describe("null-body HTTP statuses (Response constructor contract)", () => {
  it("204 and 304 throw when Response is given a body", () => {
    for (const status of [204, 304] as const) {
      assert.equal(hasNoBodyStatus(status), true);
      assert.throws(
        () => new Response(new Uint8Array([1]), { status }),
        TypeError,
      );
    }
  });

  it("204 and 304 accept null body", () => {
    for (const status of [204, 304] as const) {
      const res = new Response(null, { status });
      assert.equal(res.status, status);
    }
  });

  it("200 accepts body bytes", async () => {
    assert.equal(hasNoBodyStatus(200), false);
    const res = new Response(new Uint8Array([111, 107]), { status: 200 });
    assert.equal(await res.text(), "ok");
  });
});
