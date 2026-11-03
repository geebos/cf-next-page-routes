import { Hono } from "hono";
import type { Context } from "hono";
import {
  createTodoSchema,
  updateTodoSchema,
  type CreateTodoInput,
  type UpdateTodoInput,
} from "@repo/schemas";
import type { AppEnv } from "../types";
import { jsonValidator } from "../lib/validator";
import { createTodoRepository } from "../db/todos";

export const todosRoute = new Hono<AppEnv>();

function getTodoRepository(c: Context<AppEnv>) {
  return createTodoRepository(c.get("db"));
}

// GET /api/todos — server-side SQL ORDER BY.
// Order: uncompleted first, then high→medium→low, then earlier dueDate, then earlier createdAt.
todosRoute.get("/todos", async (c) => {
  const rows = await getTodoRepository(c).list();
  return c.json(rows);
});

// POST /api/todos
todosRoute.post("/todos", jsonValidator(createTodoSchema), async (c) => {
  const input = c.req.valid("json") as CreateTodoInput;
  const todo = await getTodoRepository(c).create(input);
  return c.json(todo, 201);
},
);

// PATCH /api/todos/:id — partial update; updatedAt always refreshed.
// keep-unchanged: resubmitting an existing past dueDate is allowed; changing
// dueDate requires calendar-midnight + loose absolute bound.
todosRoute.patch("/todos/:id", jsonValidator(updateTodoSchema), async (c) => {
  const id = c.req.param("id");
  const input = c.req.valid("json") as UpdateTodoInput;
  const todo = await getTodoRepository(c).update(id, input);
  return c.json(todo);
},
);

// DELETE /api/todos/:id
todosRoute.delete("/todos/:id", async (c) => {
  await getTodoRepository(c).delete(c.req.param("id"));
  return c.body(null, 204);
});
