import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calendarDayToMs,
  createTodoSchema,
  formatDueDateMs,
  isCalendarMidnightMs,
  isDueDateInLooseRange,
  localStartOfTodayDate,
  localStartOfTodayMs,
  LOOSE_PAST_MS,
  msToPickerDate,
  pickerDateToMs,
  PRIORITY_VALUES,
  priorityEnum,
  updateTodoSchema,
} from "./todo";

describe("todo date helpers", () => {
  it("isCalendarMidnightMs accepts Date.UTC calendar midnight only", () => {
    const midnight = Date.UTC(2024, 0, 15);
    assert.equal(isCalendarMidnightMs(midnight), true);
    assert.equal(isCalendarMidnightMs(midnight + 1), false);
    assert.equal(isCalendarMidnightMs(1.5), false);
  });

  it("isDueDateInLooseRange uses absolute lower bound from now", () => {
    const now = Date.UTC(2024, 5, 15, 12, 0, 0);
    const edge = now - LOOSE_PAST_MS;
    assert.equal(isDueDateInLooseRange(edge, now), true);
    assert.equal(isDueDateInLooseRange(edge - 1, now), false);
    assert.equal(isDueDateInLooseRange(now, now), true);
  });

  it("formatDueDateMs uses UTC YMD only", () => {
    const ms = Date.UTC(2024, 0, 5);
    assert.equal(formatDueDateMs(ms), "2024-01-05");
  });

  it("picker roundtrip preserves calendar-midnight ms", () => {
    const ms = Date.UTC(2023, 11, 31);
    assert.equal(pickerDateToMs(msToPickerDate(ms)), ms);
  });

  it("calendarDayToMs matches pickerDateToMs for local YMD", () => {
    const local = new Date(2024, 2, 10, 18, 30, 0);
    assert.equal(
      pickerDateToMs(local),
      calendarDayToMs(local.getFullYear(), local.getMonth(), local.getDate()),
    );
  });

  it("localStartOfTodayMs uses local calendar of injected now", () => {
    const now = new Date(2024, 6, 21, 15, 30, 45);
    assert.equal(localStartOfTodayMs(now), Date.UTC(2024, 6, 21));
  });

  it("localStartOfTodayDate is local wall midnight of injected now", () => {
    const now = new Date(2024, 6, 21, 15, 30, 45);
    const d = localStartOfTodayDate(now);
    assert.equal(d.getFullYear(), 2024);
    assert.equal(d.getMonth(), 6);
    assert.equal(d.getDate(), 21);
    assert.equal(d.getHours(), 0);
    assert.equal(d.getMinutes(), 0);
    assert.equal(d.getSeconds(), 0);
  });
});

describe("PRIORITY_VALUES SSOT", () => {
  it("matches priorityEnum options", () => {
    assert.deepEqual([...PRIORITY_VALUES], [...priorityEnum.options]);
  });
});

describe("createTodoSchema / updateTodoSchema", () => {
  const due = Date.UTC(2099, 0, 15);

  it("create accepts valid body", () => {
    const r = createTodoSchema.safeParse({
      task: "ok",
      priority: "medium",
      dueDate: due,
    });
    assert.equal(r.success, true);
  });

  it("create rejects empty task", () => {
    const r = createTodoSchema.safeParse({
      task: "  ",
      priority: "medium",
      dueDate: due,
    });
    assert.equal(r.success, false);
    if (!r.success) {
      assert.match(r.error.issues[0]!.message, /任务/);
    }
  });

  it("create rejects non-midnight dueDate", () => {
    const r = createTodoSchema.safeParse({
      task: "ok",
      priority: "medium",
      dueDate: due + 1,
    });
    assert.equal(r.success, false);
    if (!r.success) {
      assert.equal(r.error.issues[0]!.message, "不能选过去日期");
    }
  });

  it("update accepts partial task", () => {
    const r = updateTodoSchema.safeParse({ task: "only-task" });
    assert.equal(r.success, true);
  });

  it("update rejects empty task when provided", () => {
    const r = updateTodoSchema.safeParse({ task: "" });
    assert.equal(r.success, false);
  });

  it("update rejects non-midnight dueDate", () => {
    const r = updateTodoSchema.safeParse({ dueDate: due + 1 });
    assert.equal(r.success, false);
  });
});
