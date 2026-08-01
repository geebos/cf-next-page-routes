import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";

import { affectedRows, getEngine, getPostgresDb } from "./engine";

describe("affectedRows", () => {
  it("reads D1 meta.changes", () => {
    assert.equal(affectedRows({ meta: { changes: 2 } }), 2);
  });

  it("reads better-sqlite3 changes", () => {
    assert.equal(affectedRows({ changes: 1 }), 1);
  });

  it("defaults missing fields to 0", () => {
    assert.equal(affectedRows({}), 0);
  });

  it("preserves explicit zero for DELETE 404 path", () => {
    assert.equal(affectedRows({ meta: { changes: 0 } }), 0);
    assert.equal(affectedRows({ changes: 0 }), 0);
  });

  it("prefers meta.changes over changes", () => {
    assert.equal(affectedRows({ meta: { changes: 2 }, changes: 9 }), 2);
  });
});

describe("getEngine", () => {
  let prev: string | undefined;

  beforeEach(() => {
    prev = process.env.DB_ENGINE;
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.DB_ENGINE;
    else process.env.DB_ENGINE = prev;
  });

  it("defaults to d1 when unset", () => {
    delete process.env.DB_ENGINE;
    assert.equal(getEngine(), "d1");
  });

  it("returns sqlite when DB_ENGINE=sqlite", () => {
    process.env.DB_ENGINE = "sqlite";
    assert.equal(getEngine(), "sqlite");
  });

  it("returns postgres when DB_ENGINE=postgres", () => {
    process.env.DB_ENGINE = "postgres";
    assert.equal(getEngine(), "postgres");
  });

  it("returns d1 for unknown values", () => {
    process.env.DB_ENGINE = "d1";
    assert.equal(getEngine(), "d1");
    process.env.DB_ENGINE = "SQLITE";
    assert.equal(getEngine(), "d1");
    process.env.DB_ENGINE = "foo";
    assert.equal(getEngine(), "d1");
  });
});

describe("getPostgresDb", () => {
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
      () => getPostgresDb(),
      /POSTGRES_URL 未设置/,
    );
  });
});
