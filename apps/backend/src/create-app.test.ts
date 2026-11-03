import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";

import { todos } from "@repo/db";
import { getDb } from "./db/client";
import { createApp } from "./index";

const pgUrl = process.env.POSTGRES_URL;

describe("createApp assembly (postgres smoke)", { skip: !pgUrl }, () => {
  before(async () => {
    await getDb();
  });

  beforeEach(async () => {
    const db = await getDb();
    await db.delete(todos);
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

  it("GET /api/i18n/en/admin returns 401 without an auth resolver", async () => {
    const app = createApp();
    const res = await app.request("http://localhost/api/i18n/en/admin");
    assert.equal(res.status, 401);
  });
});
