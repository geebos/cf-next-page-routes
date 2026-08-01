import { bigint, boolean, pgTable, text } from "drizzle-orm/pg-core";

// PostgreSQL counterpart of the SQLite/D1 todos table.
// Keep the API-level validation and Todo type in todo.ts; table definitions must
// remain dialect-specific so Drizzle can generate and execute valid SQL.
export const postgresTodos = pgTable("todos", {
  id: text("id").primaryKey(),
  task: text("task").notNull(),
  priority: text("priority").notNull().default("medium"),
  dueDate: bigint("due_date", { mode: "number" }).notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const postgresSchema = {
  todos: postgresTodos,
};
