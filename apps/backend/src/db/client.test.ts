import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";

import { getDb } from "./client";

describe("getDb", () => {
  let prevUrl: string | undefined;

  beforeEach(() => {
    prevUrl = process.env.POSTGRES_URL;
    delete process.env.POSTGRES_URL;
  });

  afterEach(() => {
    if (prevUrl === undefined) delete process.env.POSTGRES_URL;
    else process.env.POSTGRES_URL = prevUrl;
  });

  it("fails before loading the driver when POSTGRES_URL is missing", async () => {
    await assert.rejects(
      () => getDb(),
      /POSTGRES_URL 未设置/,
    );
  });
});
