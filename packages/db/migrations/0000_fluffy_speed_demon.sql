CREATE TABLE "todos" (
	"id" text PRIMARY KEY NOT NULL,
	"task" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"due_date" bigint NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
