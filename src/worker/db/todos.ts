import { asc, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import {
  postgresTodos,
  sqliteSchema,
  todos,
  isCalendarMidnightMs,
  isDueDateInLooseRange,
  type CreateTodoInput,
  type Todo,
  type UpdateTodoInput,
} from "@/shared/schemas";
import { BusinessError } from "../lib/errors";
import { affectedRows, type DbEngine, type PostgresDB } from "./engine";
import type { WorkerDB } from "../types";

type SqliteDB =
  | DrizzleD1Database<typeof sqliteSchema>
  | BetterSQLite3Database<typeof sqliteSchema>;

export type TodoRepository = {
  list(): Promise<Todo[]>;
  create(input: CreateTodoInput): Promise<Todo>;
  update(id: string, input: UpdateTodoInput): Promise<Todo>;
  delete(id: string): Promise<void>;
};

function toSqliteTodo(row: typeof todos.$inferSelect): Todo {
  return {
    id: row.id,
    task: row.task,
    priority: row.priority as Todo["priority"],
    dueDate: row.dueDate,
    completed: row.completed === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toPostgresTodo(row: typeof postgresTodos.$inferSelect): Todo {
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

function createSqliteTodoRepository(db: SqliteDB): TodoRepository {
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
      return rows.map(toSqliteTodo);
    },

    async create(input) {
      const now = Date.now();
      const row = {
        ...input,
        id: crypto.randomUUID(),
        completed: 0,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(todos).values(row);
      return toSqliteTodo(row);
    },

    async update(id, input) {
      const existing = await db.select().from(todos).where(eq(todos.id, id)).get();
      if (!existing) {
        throw new BusinessError("任务不存在", 404);
      }

      validateChangedDueDate(input.dueDate, existing.dueDate);

      const patch: Partial<typeof todos.$inferInsert> = { updatedAt: Date.now() };
      if (input.task !== undefined) patch.task = input.task;
      if (input.priority !== undefined) patch.priority = input.priority;
      if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
      if (input.completed !== undefined) patch.completed = input.completed ? 1 : 0;

      await db.update(todos).set(patch).where(eq(todos.id, id));

      const updated = await db.select().from(todos).where(eq(todos.id, id)).get();
      if (!updated) {
        throw new BusinessError("任务不存在", 404);
      }
      return toSqliteTodo(updated);
    },

    async delete(id) {
      const result = await db.delete(todos).where(eq(todos.id, id));
      if (affectedRows(result) === 0) {
        throw new BusinessError("任务不存在", 404);
      }
    },
  };
}

function createPostgresTodoRepository(db: PostgresDB): TodoRepository {
  return {
    async list() {
      const rows = await db
        .select()
        .from(postgresTodos)
        .orderBy(
          asc(postgresTodos.completed),
          sql`CASE ${postgresTodos.priority} WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC`,
          asc(postgresTodos.dueDate),
          asc(postgresTodos.createdAt),
        );
      return rows.map(toPostgresTodo);
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
      await db.insert(postgresTodos).values(row);
      return toPostgresTodo(row);
    },

    async update(id, input) {
      const existing = (
        await db
          .select()
          .from(postgresTodos)
          .where(eq(postgresTodos.id, id))
          .limit(1)
      )[0];
      if (!existing) {
        throw new BusinessError("任务不存在", 404);
      }

      validateChangedDueDate(input.dueDate, existing.dueDate);

      const patch: Partial<typeof postgresTodos.$inferInsert> = {
        updatedAt: Date.now(),
      };
      if (input.task !== undefined) patch.task = input.task;
      if (input.priority !== undefined) patch.priority = input.priority;
      if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
      if (input.completed !== undefined) patch.completed = input.completed;

      await db.update(postgresTodos).set(patch).where(eq(postgresTodos.id, id));

      const updated = (
        await db
          .select()
          .from(postgresTodos)
          .where(eq(postgresTodos.id, id))
          .limit(1)
      )[0];
      if (!updated) {
        throw new BusinessError("任务不存在", 404);
      }
      return toPostgresTodo(updated);
    },

    async delete(id) {
      const rows = await db
        .delete(postgresTodos)
        .where(eq(postgresTodos.id, id))
        .returning({ id: postgresTodos.id });
      if (rows.length === 0) {
        throw new BusinessError("任务不存在", 404);
      }
    },
  };
}

export function createTodoRepository(
  engine: DbEngine,
  db: WorkerDB,
): TodoRepository {
  if (engine === "postgres") {
    return createPostgresTodoRepository(db as PostgresDB);
  }
  return createSqliteTodoRepository(db as SqliteDB);
}
