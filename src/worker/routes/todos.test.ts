import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { Hono } from "hono";

import { todos } from "@/shared/schemas";
import type { Todo } from "@/shared/schemas";
import { getSqliteDb } from "@/worker/db/engine";
import { createDbMiddleware } from "@/worker/middleware/db";
import { createErrorHandler } from "@/worker/middleware/error";
import type { AppEnv } from "@/worker/types";
import { todosRoute } from "./todos";

const DUE = Date.UTC(2099, 0, 15);

function buildApp() {
  const app = new Hono<AppEnv>();
  app.use("*", createDbMiddleware());
  app.route("/api", todosRoute);
  app.onError(createErrorHandler());
  return app;
}

async function postTodo(
  app: Hono<AppEnv>,
  body: { task: string; priority: string; dueDate: number },
) {
  return app.request("http://localhost/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("todos routes (sqlite integration)", () => {
  let tmpDir: string;
  let prevEngine: string | undefined;
  let prevDir: string | undefined;
  let prevMig: string | undefined;
  let app: Hono<AppEnv>;

  before(() => {
    prevEngine = process.env.DB_ENGINE;
    prevDir = process.env.DB_SQLITE_DIR;
    prevMig = process.env.DB_MIGRATIONS_DIR;
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "todos-it-"));
    process.env.DB_ENGINE = "sqlite";
    process.env.DB_SQLITE_DIR = tmpDir;
    process.env.DB_MIGRATIONS_DIR = path.resolve("drizzle");
    app = buildApp();
  });

  after(() => {
    if (prevEngine === undefined) delete process.env.DB_ENGINE;
    else process.env.DB_ENGINE = prevEngine;
    if (prevDir === undefined) delete process.env.DB_SQLITE_DIR;
    else process.env.DB_SQLITE_DIR = prevDir;
    if (prevMig === undefined) delete process.env.DB_MIGRATIONS_DIR;
    else process.env.DB_MIGRATIONS_DIR = prevMig;
  });

  beforeEach(async () => {
    process.env.DB_ENGINE = "sqlite";
    process.env.DB_SQLITE_DIR = tmpDir;
    process.env.DB_MIGRATIONS_DIR = path.resolve("drizzle");
    const db = await getSqliteDb();
    await db.delete(todos);
  });

  it("POST creates todo with camelCase Todo shape", async () => {
    const res = await postTodo(app, {
      task: "write tests",
      priority: "high",
      dueDate: DUE,
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as Todo;
    assert.equal(typeof body.id, "string");
    assert.ok(body.id.length > 0);
    assert.equal(body.task, "write tests");
    assert.equal(body.priority, "high");
    assert.equal(body.dueDate, DUE);
    assert.equal(body.completed, false);
    assert.equal(typeof body.createdAt, "number");
    assert.equal(typeof body.updatedAt, "number");
  });

  it("GET lists created todos", async () => {
    await postTodo(app, {
      task: "listed",
      priority: "medium",
      dueDate: DUE,
    });
    const res = await app.request("http://localhost/api/todos");
    assert.equal(res.status, 200);
    const list = (await res.json()) as Todo[];
    assert.equal(list.length, 1);
    assert.equal(list[0]!.task, "listed");
    assert.equal(list[0]!.completed, false);
  });

  it("GET empty list is []", async () => {
    const res = await app.request("http://localhost/api/todos");
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), []);
  });

  it("PATCH updates fields and refreshes updatedAt", async () => {
    const createdRes = await postTodo(app, {
      task: "old",
      priority: "low",
      dueDate: DUE,
    });
    const created = (await createdRes.json()) as Todo;

    const res = await app.request(`http://localhost/api/todos/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "new", completed: true }),
    });
    assert.equal(res.status, 200);
    const updated = (await res.json()) as Todo;
    assert.equal(updated.task, "new");
    assert.equal(updated.completed, true);
    assert.ok(updated.updatedAt >= created.updatedAt);
  });

  it("DELETE returns 204 then 404 on second delete", async () => {
    const createdRes = await postTodo(app, {
      task: "gone",
      priority: "medium",
      dueDate: DUE,
    });
    const created = (await createdRes.json()) as Todo;

    const del = await app.request(`http://localhost/api/todos/${created.id}`, {
      method: "DELETE",
    });
    assert.equal(del.status, 204);
    const delBody = await del.text();
    assert.equal(delBody, "");

    const del2 = await app.request(`http://localhost/api/todos/${created.id}`, {
      method: "DELETE",
    });
    assert.equal(del2.status, 404);
    assert.deepEqual(await del2.json(), {
      code: 404,
      message: "任务不存在",
      data: null,
    });
  });

  it("PATCH missing id returns 404", async () => {
    const res = await app.request(
      "http://localhost/api/todos/00000000-0000-0000-0000-000000000000",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "x" }),
      },
    );
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), {
      code: 404,
      message: "任务不存在",
      data: null,
    });
  });

  it("GET orders uncompleted before completed, then high before low", async () => {
    await postTodo(app, { task: "low-open", priority: "low", dueDate: DUE });
    await postTodo(app, { task: "high-open", priority: "high", dueDate: DUE });
    const highDoneRes = await postTodo(app, {
      task: "high-done",
      priority: "high",
      dueDate: DUE,
    });
    const highDone = (await highDoneRes.json()) as Todo;
    await app.request(`http://localhost/api/todos/${highDone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });

    const res = await app.request("http://localhost/api/todos");
    assert.equal(res.status, 200);
    const list = (await res.json()) as Todo[];
    assert.deepEqual(
      list.map((t) => t.task),
      ["high-open", "low-open", "high-done"],
    );
  });

  it("PATCH keeps existing past dueDate unchanged", async () => {
    const pastDue = Date.UTC(2020, 0, 1);
    const id = crypto.randomUUID();
    const now = Date.now();
    const db = await getSqliteDb();
    await db.insert(todos).values({
      id,
      task: "legacy",
      priority: "medium",
      dueDate: pastDue,
      completed: 0,
      createdAt: now,
      updatedAt: now,
    });

    const res = await app.request(`http://localhost/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "legacy-renamed", dueDate: pastDue }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as Todo;
    assert.equal(body.task, "legacy-renamed");
    assert.equal(body.dueDate, pastDue);
  });

  it("PATCH changing dueDate to far past is rejected", async () => {
    const createdRes = await postTodo(app, {
      task: "dated",
      priority: "medium",
      dueDate: DUE,
    });
    const created = (await createdRes.json()) as Todo;
    const farPast = Date.UTC(2020, 0, 1);

    const res = await app.request(`http://localhost/api/todos/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: farPast }),
    });
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), {
      code: 400,
      message: "不能选过去日期",
      data: null,
    });
  });
});
