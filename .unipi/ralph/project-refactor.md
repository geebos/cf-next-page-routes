# 全项目渐进式代码优化

在不改变现有外部行为的前提下，持续改善项目设计、可维护性和测试质量。

## Goals

- 遵循 SOLID，优先单一职责、高内聚、低耦合
- 每轮一个小改动，经 design-challenger + code-reviewer
- 记录写入 `docs/refator/NN.title.md`

## Checklist

- [x] Iter 01–10: first reflection cycle (see archive notes below)
- [x] Iter 11: todos sqlite integration (CRUD + 404)
- [x] Iter 12: todos ORDER BY + keep-unchanged past dueDate
- [x] Iter 13: pickLocale tests
- [x] Iter 14: createApp sqlite smoke
- [x] Iter 15: create/update schema safeParse
- [x] Iter 16: remove unused React import in list.tsx
- [x] Iter 17: export isActive + navigate tests
- [x] Iter 18: resolveAppLocale SSOT (3 call sites)
- [x] Iter 19: request null-body contract + non-Tauri throw
- [x] Iter 20: second reflection checkpoint

## Notes

### Reflection checkpoint 2 (after Iter 20) — 2026-07-21

1. **Accomplished (11–19)**
   - First real **sqlite integration** for todos routes (CRUD, order, dueDate keep/reject)
   - **createApp** assembly smoke
   - Production DRY: `resolveAppLocale` (3 sites), unused React import, export `isActive`
   - Tests: **54 → 90** (`pnpm test`)
   - Records `docs/refator/11` … `19`

2. **Working well**
   - Challenger still kills pure-churn (TodoPage hook split, hello smoke alone, isAbsoluteUrl export, health file, etc.)
   - Integration harness (temp sqlite + mini app) unblocked real route contracts
   - Strict vs fuzzy locale split (`resolveAppLocale` vs `normalizeLocale`) is clearer

3. **Blocking / friction**
   - `mock.module` unavailable without experimental flags → Tauri path hard to unit-test
   - Process-level `getSqliteDb` singleton limits multi-dir tests
   - High-ROI **production** refactors still scarce; most remaining smells are knip/unused template stubs

4. **Approach adjustment**
   - Prefer: more **integration** (ordering edge cases, createApp table of mounts) only when new contract risk appears
   - Prefer: **production** only with multi-site DRY or dead-code with confirmed private intent
   - Avoid: stacking more pure-function tests without new evidence
   - Consider next: dual-engine only if D1 test harness appears; demo page form extract only with AGENTS evidence

5. **Next priorities**
   1. Optional: createApp mount table (health/todos/hello non-404) if mounting mistakes recur
   2. Optional: delete-dialog RTL only if UI regression appears
   3. knip intentional public APIs (`apiFetch`, template middleware) — document or leave
   4. Do **not** reopen: TodoPage handler hook, BusinessError+ApiError merge, latency hang, PATCH double-select without more evidence

### Iteration log (11–20)

| Iter | Record | Kind |
| ------ | -------- | ------ |
| 11 | `11.todos-sqlite-integration.md` | integration tests |
| 12 | `12.todos-order-and-due-date.md` | integration tests |
| 13 | `13.pick-locale-tests.md` | unit tests |
| 14 | `14.create-app-sqlite-smoke.md` | assembly smoke |
| 15 | `15.todo-schema-safeparse.md` | unit tests |
| 16 | `16.remove-unused-react-import-list.md` | production cleanup |
| 17 | `17.export-isActive-nav-tests.md` | export + unit |
| 18 | `18.resolve-app-locale.md` | production SSOT |
| 19 | `19.request-null-body-contract.md` | unit/contract |
| 20 | reflection (this section) | process |

### Rejected this cycle (11–20)

- TodoPage handlers → hook
- knip de-export apiFetch (intent unclear)
- POST empty-task integration (already schema+validator)
- warmupNetworkPermission no-op
- health route solo file
- PRIORITY_BADGE_CLASS satisfies rewrite
- export isAbsoluteUrl
- hello solo smoke
- useCurrentLocale export from navigate (use resolveAppLocale instead)
- delete-dialog guard extract
- ORDER_BY_PRIORITY constant
- adapter fetch global mock (REVISE/weak)
- html_handling (already force-trailing-slash)

### First cycle summary (01–10)

- Production: apiErrorMessage, PRIORITY_VALUES SSOT
- Tests: date helpers, error handler, validator, affectedRows, getEngine, i18n paths, settings, getBaseUrl
- `package.json` `"test"` script
- Tests grew ~9 → 54

## 限制

- 每轮只完成一个小改动；审查未通过不得推进。
- 本会话手动维护 `.unipi/ralph/*.state.json`。
