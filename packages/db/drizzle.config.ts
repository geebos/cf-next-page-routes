import { defineConfig } from "drizzle-kit";

// Default dialect: PostgreSQL — generate-only. Apply migrations with
// `drizzle-kit migrate`; the connection string is only read by that command.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/todos.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.POSTGRES_URL ?? "",
  },
});
