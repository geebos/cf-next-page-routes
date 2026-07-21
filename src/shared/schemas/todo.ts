import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";

/** Product day → wire ms at UTC midnight of that YMD. */
export function calendarDayToMs(y: number, m: number, d: number): number {
  return Date.UTC(y, m, d);
}

/** Browser only. Local calendar YMD of `now` as UTC-midnight ms. Do not call on Worker. */
export function localStartOfTodayMs(now = new Date()): number {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Browser only. Local wall-clock midnight Date for day-picker `disabled.before`. */
export function localStartOfTodayDate(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Display dueDate via UTC parts only — never local wall-clock. */
export function formatDueDateMs(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const LOOSE_PAST_MS = 48 * 60 * 60 * 1000;

/** True when `n` is exactly Date.UTC of its UTC Y/M/D (calendar-midnight shape). */
export function isCalendarMidnightMs(n: number): boolean {
  if (!Number.isInteger(n)) return false;
  const d = new Date(n);
  return n === Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Absolute lower bound to reject garbage past values (not user-local "today"). */
export function isDueDateInLooseRange(n: number, now = Date.now()): boolean {
  return n >= now - LOOSE_PAST_MS;
}

/** UTC YMD of stored ms → local Date at local midnight (picker selection day). */
export function msToPickerDate(ms: number): Date {
  const d = new Date(ms);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Picker local Date → store ms at Date.UTC of local YMD. */
export function pickerDateToMs(d: Date): number {
  return calendarDayToMs(d.getFullYear(), d.getMonth(), d.getDate());
}

export const PRIORITY_VALUES = ["low", "medium", "high"] as const;
export const priorityEnum = z.enum(PRIORITY_VALUES);

// Create: shared path (client resolver + Worker) only checks calendar-midnight shape
// + absolute loose bound. User-local "today" is enforced in the browser form only.
export const createTodoSchema = z.object({
  task: z.string().trim().min(1, "任务不能为空").max(200, "任务最多 200 字符"),
  priority: priorityEnum,
  dueDate: z
    .number()
    .int()
    .refine(isCalendarMidnightMs, "不能选过去日期")
    .refine((n) => isDueDateInLooseRange(n), "不能选过去日期"),
});

// Update: optional dueDate may keep an existing past value (no local min-day /
// loose check here). Midnight shape only so storage stays calendar days.
// keep-unchanged vs changed loose enforcement lives in worker PATCH.
export const updateTodoSchema = z.object({
  task: z.string().trim().min(1, "任务不能为空").max(200, "任务最多 200 字符").optional(),
  priority: priorityEnum.optional(),
  dueDate: z
    .number()
    .int()
    .refine(isCalendarMidnightMs, "不能选过去日期")
    .optional(),
  completed: z.boolean().optional(),
});

export const todoSchema = z.object({
  id: z.string(),
  task: z.string(),
  priority: priorityEnum,
  dueDate: z.number().int(),
  completed: z.boolean(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  task: text("task").notNull(),
  priority: text("priority").notNull().default("medium"),
  dueDate: integer("due_date").notNull(),
  completed: integer("completed").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export type Priority = z.infer<typeof priorityEnum>;
export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
