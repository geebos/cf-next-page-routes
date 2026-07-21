import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Hono } from "hono";

import { BusinessError } from "../lib/errors";
import { createErrorHandler } from "./error";

function buildApp() {
  const app = new Hono();
  app.onError(createErrorHandler());
  return app;
}

describe("createErrorHandler", () => {
  it("maps BusinessError to status + { code, message, data: null }", async () => {
    const app = buildApp();
    app.get("/biz", () => {
      throw new BusinessError("任务不存在", 404);
    });

    const res = await app.request("http://localhost/biz");
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), {
      code: 404,
      message: "任务不存在",
      data: null,
    });
  });

  it("maps BusinessError 400 with message", async () => {
    const app = buildApp();
    app.get("/bad", () => {
      throw new BusinessError("参数错误", 400);
    });

    const res = await app.request("http://localhost/bad");
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), {
      code: 400,
      message: "参数错误",
      data: null,
    });
  });

  it("maps unknown Error to 500 without leaking message", async () => {
    const app = buildApp();
    app.get("/boom", () => {
      throw new Error("secret internals");
    });

    const res = await app.request("http://localhost/boom");
    assert.equal(res.status, 500);
    const body = (await res.json()) as {
      code: number;
      message: string;
      data: unknown;
    };
    assert.equal(body.code, 500);
    assert.equal(body.message, "服务器错误");
    assert.equal(body.data, null);
    assert.equal(JSON.stringify(body).includes("secret internals"), false);
  });

});
