# Project Code Review

**Date:** 2026-07-20  
**Branch:** `tarpon` (aligned with `main`; no range diff — full app review)  
**Scope:** Worker, API client, schemas, adapters, i18n, pages, todo/test UI, Tauri proxy  
**Excluded:** shadcn `src/components/ui/*` internals (unless broken by app usage)  
**Method:** multi-angle finders → script + line verification → gap sweep  
**Effort:** max (recall mode)

---

## Summary

| Severity | Count | Notes |
|----------|------:|-------|
| Critical / High | 10 | Correctness + security with concrete triggers |
| Medium | 5 | Confirmed or strong PLAUSIBLE |
| Gap (additional) | 8 | Found in Phase 3 sweep; not in primary top-15 cap |
| **Total actionable** | **23** | |

**Suggested fix order:**

1. D1 bookmark empty-string + `secure` cookie  
2. dueDate UTC vs local (form + list + schema)  
3. Tauri proxy SSRF / ACL / allowlist  
4. 500 error message leak  
5. Delete dialog close race  
6. Config mismatches (serve default engine, wrangler trailing slash)

---

## Confirmed findings (primary)

### 1. D1 bookmark cookie written as empty string

| | |
|---|---|
| **File** | `src/worker/middleware/db.ts:30` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** After each D1 request the middleware does:

```ts
setCookie(c, BOOKMARK_COOKIE, session.getBookmark() ?? "", { ... });
```

On the next request:

```ts
const bookmark = getCookie(c, BOOKMARK_COOKIE) ?? DEFAULT_BOOKMARK;
```

`??` only replaces `null`/`undefined`, so `""` is kept and becomes `withSession("")` instead of `"first-unconstrained"`.

**Failure:** Create a todo (good bookmark) → `_app` `warmupNetworkPermission()` hits `GET /api/health` (db middleware, no query) → cookie overwritten to `d1_bm=` → subsequent `listTodos` loses read-your-writes (or session errors) until cookie expires (`maxAge` 1h).

**Fix direction:** Coalesce empty to default on both write and read (`getBookmark() || DEFAULT_BOOKMARK`), or omit/delete the cookie when bookmark is null.

---

### 2. Create dueDate: local calendar vs UTC gate

| | |
|---|---|
| **File** | `src/components/pages/todo/forms/todo-form.tsx:138` (+ `src/shared/schemas/todo.ts`) |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** Form encodes picked day as `Date.UTC(localY, localM, localD)` and disables with `{ before: new Date() }` (local). Schema refine uses `utcStartOfTodayMs()` (UTC calendar day).

**Failure:** User in `America/Los_Angeles` at 2026-07-19 18:00 local (UTC already 2026-07-20 01:00) selects local “today” 7/19 → stores `2026-07-19T00:00:00Z` → server/client refine against UTC today 7/20 → `"不能选过去日期"` while UI allowed the day.

**Fix direction:** One shared “calendar day” helper for `onSelect`, `disabled`, and Zod refine (same clock semantics).

---

### 3. List dueDate display off-by-one west of UTC

| | |
|---|---|
| **File** | `src/components/pages/todo/list.tsx:116` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** Values stored as UTC midnight are shown with `format(new Date(todo.dueDate), "yyyy-MM-dd")` (local TZ). Overdue uses `utcStartOfTodayMs()`.

**Failure:** `dueDate = Date.UTC(2026, 6, 20)` displays as `2026-07-19` in Los Angeles; label and overdue badge can disagree.

**Fix direction:** Format with UTC date parts (or the same calendar-day helper as create).

---

### 4. Tauri `proxy` unrestricted SSRF

| | |
|---|---|
| **File** | `src-tauri/src/lib.rs:31` |
| **Verdict** | CONFIRMED |
| **Category** | Security |

**Issue:** Command comment and implementation: accepts any `url`/`method`/`headers`/`body` and “bypasses the http plugin's URL allow-list”. Exposed via `src/lib/adapter/request.ts` and `/[locale]/test`.

**Failure:** Webview (or XSS) `invoke("proxy", { args: { url: "http://169.254.169.254/...", method: "GET" } })` or LAN targets. `capabilities` only restrict `http:default`, not this command.

**Fix direction:** URL allowlist in Rust (or remove open proxy); keep policy in one place.

---

### 5. Internal 500 leaks `err.message`

| | |
|---|---|
| **File** | `src/worker/middleware/error.ts:17` |
| **Verdict** | CONFIRMED |
| **Category** | Security |

**Issue:**

```ts
return c.json(
  { code: 500, message: err instanceof Error ? err.message : "服务器错误", data: null },
  500,
);
```

Frontend `parseError` → toasts surface the string.

**Failure:** `DB_SQLITE_DIR 未设置…`, SQL/driver/path details leak to clients.

**Fix direction:** Always return a generic public message; log full error server-side only.

---

### 6. `d1_bm` always `secure: true`

| | |
|---|---|
| **File** | `src/worker/middleware/db.ts:32` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** Bookmark cookie always `secure: true`. Browsers do not store Secure cookies on plain `http://localhost`.

**Failure:** Local wrangler HTTP never persists bookmark; read-your-writes continuity never exercises in local HTTP dev.

**Fix direction:** `secure` based on request protocol / env (e.g. secure only when `https` or production).

---

### 7. `request()` null-body only for 204/304

| | |
|---|---|
| **File** | `src/lib/adapter/request.ts:43` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** Only 204/304 force `body: null`. Fetch forbids body on 205 (and 101/103). `new Response(Uint8Array, { status: 205 })` throws.

**Failure:** Proxy returns 205 with non-empty body → Test page `request()` throws constructor error instead of a `Response`.

**Fix direction:** Align with Fetch null-body statuses: `101, 103, 204, 205, 304` (same as `@tauri-apps/plugin-http`).

---

### 8. Multi-value headers (Set-Cookie) comma-folded

| | |
|---|---|
| **File** | `src-tauri/src/lib.rs:59` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** Duplicate headers merged with `", "`. `Set-Cookie` must not be comma-joined.

**Failure:** Multiple `Set-Cookie` → one broken string; cookie-based auth via proxy path fails.

**Fix direction:** Special-case `set-cookie` (array / separate IPC field) or only fold safe headers.

---

### 9. `apiFetch` credentials / Tauri cross-origin cookies

| | |
|---|---|
| **File** | `src/lib/api.ts:34` |
| **Verdict** | PLAUSIBLE |
| **Category** | Correctness |

**Issue:** No `credentials` option. Tauri always absolutizes API URL (`DEFAULT_TAURI_BASE_URL` / `NEXT_PUBLIC_BASE_URL`) → cross-origin vs webview. Browser would not send `d1_bm` by default; plugin-http cookie jar behavior unproven.

**Failure:** Create then list in Tauri may miss just-written row if bookmark cookie is not sent.

**Fix direction:** Explicit cookie/session strategy for Tauri; or same-origin worker; document that bookmarks require credentials.

---

### 10. Delete dialog closes before async confirm finishes

| | |
|---|---|
| **File** | `src/components/pages/todo/delete-dialog.tsx:48` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** Radix `AlertDialogAction` closes on click; parent `onOpenChange(false)` clears `deletingTodo` and unmounts while `deleteTodo()` still runs.

**Failure:** Pending spinner ineffective; failure only toasts after close; rapid re-open can race previous DELETE.

**Fix direction:** `event.preventDefault()` on action click; close only after success (or keep dialog open on error).

---

### 11. `getSqliteDb` concurrent init race

| | |
|---|---|
| **File** | `src/worker/db/engine.ts:29` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** TOCTOU: two cold requests both see `sqliteDb === null`, both `new Database` + `migrate()`, then assign.

**Failure:** `SQLITE_BUSY`, half-applied migrations, or leaked connections under concurrent first hits.

**Fix direction:** In-flight promise singleton (mutex) for init.

---

### 12. `pickLocale` missing locale key → `undefined`

| | |
|---|---|
| **File** | `src/lib/i18n-static.ts:52` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** Leaf returns `node[locale]` with no fallback when key missing.

**Failure:** Leaf `{ en: "Hello" }` for `zh-CN` yields `undefined` (blank UI); incomplete translation files break quietly.

**Fix direction:** Fall back to `DEFAULT_LOCALE` leaf string when missing.

---

### 13. `_app` i18n with missing pageProps (404)

| | |
|---|---|
| **File** | `src/pages/_app.tsx:34` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** i18n built from `pageProps.locale/messages/fallbackMessages`. `pages/404.tsx` has no i18n `getStaticProps`. Path is not `/`, so `Layout` still mounts (nav uses `t()`).

**Failure:** 404 shows Layout with empty/broken translation keys.

**Fix direction:** Guard `_app` when props missing; or give 404 static i18n props / skip Layout for error pages.

---

### 14. Update allows any past `dueDate`

| | |
|---|---|
| **File** | `src/shared/schemas/todo.ts:27` |
| **Verdict** | CONFIRMED |
| **Category** | Correctness |

**Issue:** Create forbids past due dates; update is only `z.number().int().optional()` (comment covers keeping existing past, not deliberate backdating).

**Failure:** `PATCH { dueDate: 0 }` succeeds — domain rule only on insert.

**Fix direction:** If product allows “keep past”, still reject newly set past dates (compare to existing row or “only if unchanged”).

---

### 15. Todo page uses native `<section>` vs `components/ui/Section`

| | |
|---|---|
| **File** | `src/pages/[locale]/todo.tsx:129` |
| **Verdict** | CONFIRMED |
| **Category** | Conventions |

**Issue:** AGENTS.md: do not use native HTML when an equivalent exists in `components/ui/`. Test page uses `Section`; todo uses raw `<section>`.

**Failure:** Inconsistent layout/styling and rule violation when adding pages.

**Fix direction:** Use `Section` like the test page.

---

## Gap sweep (additional)

Not in the primary top-15 cap; still real and worth tracking.

### G1. Tauri `http:default` allowlist too narrow

| | |
|---|---|
| **File** | `src-tauri/capabilities/default.json:14` |

Only `https://template.geebosblog.com/*`. Local worker (`localhost:8787`) or other `NEXT_PUBLIC_BASE_URL` hosts are rejected by plugin-http for `apiFetch` / Todo API in desktop builds.

---

### G2. Custom commands not in capabilities ACL

| | |
|---|---|
| **File** | `src-tauri/capabilities/default.json:8` |

`proxy` / `greet` registered in `invoke_handler` but not allowlisted. Tauri 2 ACL denies commands by default → `/test` `invoke("proxy")` may always fail.

---

### G3. Node `serve.ts` defaults to D1 without binding

| | |
|---|---|
| **File** | `src/worker/serve.ts:9` |

Bare `tsx src/worker/serve.ts` (without `DB_ENGINE=sqlite`) takes D1 branch → `c.env.DB` undefined → all `/api/*` 500.

---

### G4. SQLite migrations path is CWD-relative

| | |
|---|---|
| **File** | `src/worker/db/engine.ts:45` |

`migrationsFolder: "./drizzle"` fails if process cwd is not repo root (systemd, IDE run config).

---

### G5. better-sqlite3 no `busy_timeout` / WAL

| | |
|---|---|
| **File** | `src/worker/db/engine.ts:41` |

Overlapping writes under `dev:sqlite` can throw `SQLITE_BUSY` as 500 instead of waiting.

---

### G6. `Html lang` never updates on client locale switch

| | |
|---|---|
| **File** | `src/pages/_document.tsx:33` |

LanguageSwitcher does client `router.push`; `document.documentElement.lang` stays at first paint.

---

### G7. Wrangler `drop-trailing-slash` vs Next `trailingSlash: true`

| | |
|---|---|
| **File** | `wrangler.jsonc:28` |

App and `localizePath` emit trailing slashes; CF assets config drops them with 308 — extra hop and SEO friction.

---

### G8. Proxy client has no request timeout

| | |
|---|---|
| **File** | `src-tauri/src/lib.rs:36` |

Default `reqwest::Client` per call, no connect/request timeout → hung host freezes Test UI spinner indefinitely.

---

## Not treated as bugs (intentional / template)

| Topic | Why not filed as primary bug |
|-------|------------------------------|
| Auth middleware exists but not mounted | Scaffold for future auth; todos public by design for demo |
| Demo page inlines form logic | Showcase page, not product form (still AGENTS-violating if treated as product) |
| Update keeps existing past dueDate | Documented intent; open hole is *changing* to arbitrary past (#14) |
| Static export + rewrites only in dev | Documented architecture; production must host worker + set base URL |

---

## Efficiency / cleanup notes (non-blocking)

Lower severity; useful for follow-up polish:

- Todo page: four nearly identical mutate/toast handlers → one helper  
- Full `listTodos()` after every mutation instead of using returned entity  
- `reqwest::Client` rebuilt every proxy invoke  
- `Array.from` entire body for IPC (`number[]`)  
- i18next `createInstance` on every messages identity change in `_app`  
- `utcStartOfTodayMs()` inside `todos.map` per row  
- Duplicate route-locale resolution (`useCurrentLocale` pattern) across Seo / LocalizedLink / LanguageSwitcher  
- `FormValues` redeclares shape of `CreateTodoInput`  
- `PRIORITY_VALUES` hardcoded vs `priorityEnum`  

---

## Verification evidence (scripts)

```text
empty cookie ?? DEFAULT  → ""
empty cookie || DEFAULT  → "first-unconstrained"
Date.UTC(2026,6,20) as LA date → 2026-07-19
LA evening encode local 7/19 vs UTC today 7/20 → refine fails
new Response(body, { status: 205 }) → throws
pickLocale({en:"x"}, "zh-CN") → undefined
```

---

## Recommended fix batches

### Batch A — Session / D1 (high)

1. Bookmark empty-string coalesce (#1)  
2. `secure` conditional on HTTPS (#6)  
3. Decide Tauri cookie strategy (#9, G1)

### Batch B — Dates (high)

1. Shared calendar-day helper for form + list + schema (#2, #3)  
2. Tighten update past-date policy (#14)

### Batch C — Tauri security & network (high)

1. Proxy allowlist or remove open proxy (#4)  
2. Capability ACL for `proxy` (G2)  
3. Align http allowlist with deploy hosts (G1)  
4. Null-body statuses + Set-Cookie handling (#7, #8)  
5. Request timeouts (G8)

### Batch D — Worker robustness (medium)

1. 500 generic message (#5)  
2. `getSqliteDb` init lock (#11)  
3. serve default engine / migrations path (G3, G4)  
4. busy_timeout (G5)

### Batch E — Frontend polish (medium/low)

1. Delete dialog preventDefault (#10)  
2. `_app` / 404 i18n (#13)  
3. `pickLocale` fallback (#12)  
4. Todo `Section` convention (#15)  
5. `lang` update + wrangler trailing slash (G6, G7)

---

## Appendix: review process

1. **Phase 0** — `main...HEAD` empty; whole-repo app sources in scope  
2. **Phase 1** — 10 finder angles (correctness A–E, reuse, simplification, efficiency, altitude, conventions)  
3. **Phase 2** — 1-vote verify (`CONFIRMED` / `PLAUSIBLE` / `REFUTED`)  
4. **Phase 3** — Gap sweep for defects not in the first list  

Primary report capped at ≤15 findings (recall ranking). Gap items kept here for completeness.
