import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import { createApp } from "./index";

describe("createApp assembly (sqlite smoke)", () => {
  let tmpDir: string;
  let prevEngine: string | undefined;
  let prevDir: string | undefined;
  let prevMig: string | undefined;

  before(() => {
    prevEngine = process.env.DB_ENGINE;
    prevDir = process.env.DB_SQLITE_DIR;
    prevMig = process.env.DB_MIGRATIONS_DIR;
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "create-app-"));
    process.env.DB_ENGINE = "sqlite";
    process.env.DB_SQLITE_DIR = tmpDir;
    process.env.DB_MIGRATIONS_DIR = path.resolve("drizzle");
  });

  after(() => {
    if (prevEngine === undefined) delete process.env.DB_ENGINE;
    else process.env.DB_ENGINE = prevEngine;
    if (prevDir === undefined) delete process.env.DB_SQLITE_DIR;
    else process.env.DB_SQLITE_DIR = prevDir;
    if (prevMig === undefined) delete process.env.DB_MIGRATIONS_DIR;
    else process.env.DB_MIGRATIONS_DIR = prevMig;
  });

  it("GET /api/health returns ok", async () => {
    const app = createApp();
    const res = await app.request("http://localhost/api/health");
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  });

  it("GET /api/todos empty list via full createApp mount", async () => {
    const app = createApp();
    const res = await app.request("http://localhost/api/todos");
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), []);
  });
});
