import { defineConfig } from "drizzle-kit";

// PostgreSQL migration config. The connection string is only needed by
// `drizzle-kit migrate`; schema generation does not open a database connection.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/schemas/todo-postgres.ts",
  out: "./drizzle-postgres",
  dbCredentials: {
    url: process.env.POSTGRES_URL ?? "",
  },
});
