import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Hono } from "hono";
import { z } from "zod";

import { createErrorHandler } from "../middleware/error";
import { jsonValidator } from "./validator";

const sampleSchema = z.object({
  task: z.string().min(1, "任务不能为空"),
});

function buildApp() {
  const app = new Hono();
  app.onError(createErrorHandler());
  app.post("/items", jsonValidator(sampleSchema), (c) => {
    const body = c.req.valid("json");
    return c.json(body, 200);
  });
  return app;
}

describe("jsonValidator", () => {
  it("accepts valid JSON and exposes parsed body", async () => {
    const app = buildApp();
    const res = await app.request("http://localhost/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "hi" }),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { task: "hi" });
  });

  it("rejects invalid body as BusinessError 400 with first issue message", async () => {
    const app = buildApp();
    const res = await app.request("http://localhost/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "" }),
    });
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), {
      code: 400,
      message: "任务不能为空",
      data: null,
    });
  });
});
