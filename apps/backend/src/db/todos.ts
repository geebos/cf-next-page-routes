import { asc, eq, sql } from "drizzle-orm";

import { todos } from "@repo/db";
import {
  isCalendarMidnightMs,
  isDueDateInLooseRange,
  type CreateTodoInput,
  type Todo,
  type UpdateTodoInput,
} from "@repo/schemas";
import { BusinessError } from "../lib/errors";
import type { AppDB } from "./client";

export type TodoRepository = {
  list(): Promise<Todo[]>;
  create(input: CreateTodoInput): Promise<Todo>;
  update(id: string, input: UpdateTodoInput): Promise<Todo>;
  delete(id: string): Promise<void>;
};

function toTodo(row: typeof todos.$inferSelect): Todo {
  return {
    id: row.id,
    task: row.task,
    priority: row.priority as Todo["priority"],
    dueDate: row.dueDate,
    completed: row.completed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function validateChangedDueDate(
  dueDate: number | undefined,
  existingDueDate: number,
): void {
  if (
    dueDate !== undefined &&
    dueDate !== existingDueDate &&
    (!isCalendarMidnightMs(dueDate) || !isDueDateInLooseRange(dueDate))
  ) {
    throw new BusinessError("不能选过去日期", 400);
  }
}

export function createTodoRepository(db: AppDB): TodoRepository {
  return {
    async list() {
      const rows = await db
        .select()
        .from(todos)
        .orderBy(
          asc(todos.completed),
          sql`CASE ${todos.priority} WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC`,
          asc(todos.dueDate),
          asc(todos.createdAt),
        );
      return rows.map(toTodo);
    },

    async create(input) {
      const now = Date.now();
      const row = {
        ...input,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(todos).values(row);
      return toTodo(row);
    },

    async update(id, input) {
      const existing = (
        await db.select().from(todos).where(eq(todos.id, id)).limit(1)
      )[0];
      if (!existing) {
        throw new BusinessError("任务不存在", 404);
      }

      validateChangedDueDate(input.dueDate, existing.dueDate);

      const patch: Partial<typeof todos.$inferInsert> = {
        updatedAt: Date.now(),
      };
      if (input.task !== undefined) patch.task = input.task;
      if (input.priority !== undefined) patch.priority = input.priority;
      if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
      if (input.completed !== undefined) patch.completed = input.completed;

      await db.update(todos).set(patch).where(eq(todos.id, id));

      const updated = (
        await db.select().from(todos).where(eq(todos.id, id)).limit(1)
      )[0];
      if (!updated) {
        throw new BusinessError("任务不存在", 404);
      }
      return toTodo(updated);
    },

    async delete(id) {
      const rows = await db
        .delete(todos)
        .where(eq(todos.id, id))
        .returning({ id: todos.id });
      if (rows.length === 0) {
        throw new BusinessError("任务不存在", 404);
      }
    },
  };
}
