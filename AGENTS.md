# 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

# 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

# 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

# 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# 5. Development Branch Workflow

**This workflow does not create or remove worktrees. Keep the main worktree clean.**

## Start
1. Check the current branch:
   ```bash
   git branch --show-current
   ```
2. Prepare a development branch:
   * If currently on `main`:
     ```bash
     git switch -c dev/<short-description>
     ```
   * Otherwise, confirm the current branch is for this task and rename it if needed:
     ```bash
     git branch -m dev/<short-description>
     ```
3. Keep all development commits on the development branch. Do not push it unless explicitly requested.

## Squash Commit Message

The squash commit message **must use Conventional Commits and list every meaningful change**. Do not use only a generic one-line message.

```text
<type>[optional scope]: <description>

- <change 1>
- <change 2>
- <change 3>
```

## Complete and Merge

After completion is confirmed:

1. Commit and review all changes:
   ```bash
   git status
   git log main..HEAD --oneline
   ```
2. Create an integration branch from `main` and squash the development branch:
   ```bash
   DEV_BRANCH=$(git branch --show-current)

   git switch -c integrate/<short-description> main
   git merge --squash "$DEV_BRANCH"
   git commit
   ```
3. Rebase onto the latest remote `main` and run the required tests:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
4. Update and push `main` from the main worktree.
   **If the current worktree is not the main worktree, do not check out ****`main`**** here. Locate the worktree where ****`main`**** is checked out and run the following commands from that directory instead.**
   ```bash
   git switch main
   git pull --ff-only origin main
   git merge --ff-only integrate/<short-description>
   git push origin main
   ```
5. After verifying the merge, delete the local development and integration branches:
   ```bash
   git branch -d dev/<short-description>
   git branch -d integrate/<short-description>
   ```

Delete the remote development branch only if it was previously pushed.

# 6. Project Structure

```txt
apps/
├── frontend/           # Next.js static export (Pages Router)
│   ├── src/
│   │   ├── pages/      # Page routes, organized by route
│   │   │   ├── _app.tsx        # Injects global Layout and globals.css
│   │   │   ├── _document.tsx   # HTML skeleton
│   │   │   ├── index.tsx       # Language landing page
│   │   │   └── [locale]/       # Localized route tree
│   │   ├── components/
│   │   │   ├── ui/     # shadcn/ui component library, do not edit directly
│   │   │   ├── layout/ # Layout / Page / Navigate
│   │   │   └── pages/  # Page-specific components
│   │   │       └── <page>/    # Create only when the page has components worth extracting
│   │   │           ├── *.tsx  # Complex or independently meaningful page-specific components
│   │   │           └── forms/ # Form components for the page
│   │   │               └── <name>-form.tsx
│   │   ├── hooks/      # React hooks
│   │   ├── lib/        # Frontend-only utilities; api.ts is the only API entry; i18n/ is the unified translate hook
│   │   └── styles/     # Global styles / Tailwind theme
│   ├── public/         # Static assets (locale copy lives in @repo/i18n)
│   ├── next.config.ts  # Static export + dev rewrites proxy + i18n codegen
│   └── components.json # shadcn config
├── backend/            # Hono Worker API
│   ├── src/
│   │   ├── index.ts    # Worker entry; imports routes centrally
│   │   ├── serve.ts    # Node entry (@hono/node-server) + PostgreSQL
│   │   ├── routes/     # Routes split by domain, as files or directories
│   │   ├── middleware/ # Worker middleware
│   │   ├── db/         # pg connection + repository (schema from @repo/db)
│   │   └── lib/        # Worker utilities
│   └── wrangler.jsonc  # Optional Worker deployment config
└── tauri/              # Tauri v2 shell (Rust)
packages/
├── schemas/            # Shared Zod schemas, API types and domain helpers (@repo/schemas)
│   ├── src/index.ts    # Unified exports
│   └── src/<domain>.ts # One file per domain
├── db/                 # Drizzle table definitions + generated migrations (@repo/db)
│   ├── src/<domain>.ts # Table file, named by domain (not by dialect)
│   ├── migrations/     # Generated migrations
│   └── drizzle.config.ts
├── i18n/               # @repo/i18n: YAML locale sources, config function, codegen
│   ├── locales/public/<namespace>/**/*.yml  # SSG-injected copy
│   ├── locales/private/<namespace>/**/*.yml # backend-only copy
│   ├── src/config.ts   # getI18nConfig(): defaultLocale + locales
│   ├── src/compile.ts  # compiler core (Node only)
│   └── generated/      # gitignored codegen output (manifest/public/private)
└── lib/                # Shared framework-agnostic utilities (@repo/lib)
```

# 7. Project Rules

## Pages & Components

- Place pages under `apps/frontend/src/pages/` following the route structure.
- Every page **must** be wrapped with `Page` from `components/layout/page`.
- Before building UI, **always** check `components/ui/` for an existing component.
- Reuse existing components whenever possible.
- Create new components **only if no suitable implementation exists**.
- **Do not** use native HTML elements when an equivalent component exists in `components/ui/`.
- Do not place complete page-level JSX under `src/components/`. Keep the overall page structure and page-level composition in `src/pages/`.
- Use `src/components/pages/<page>/` only for complex, shared, or clearly scoped page-specific components, as well as form components.


## Schemas

- Place Zod schemas, API types and domain helpers under `packages/schemas/src/`, **one file per domain**; import them from `@repo/schemas`.
- Place Drizzle table definitions, migrations and `drizzle.config.ts` under `packages/db/`, **one file per domain**, named by domain (`src/todos.ts`) rather than by dialect; import them from `@repo/db`.
- Keep validation/types and table definitions separate: `@repo/schemas` is the API-level source of truth, `@repo/db` is the persistence-level source of truth.
- PostgreSQL is the only database backend. Do not add parallel dialect directories or engine switches; to change databases, replace `packages/db` and `apps/backend/src/db` wholesale.

## Worker

- Organize routes by domain under `apps/backend/src/routes/` and mount them centrally in `apps/backend/src/index.ts`.

## Forms

- Define forms in `apps/frontend/src/components/pages/<page>/forms/` using the `<name>-form.tsx` naming convention.
- A form file may export action-specific components using the `<Action><Name>Form` naming convention, such as `CreateUserForm` and `EditUserForm`.
- Pages should import and use form components instead of implementing form logic directly.
- Keep form APIs domain-specific. **Do not over-generalize** props or abstractions. Form-specific business logic belongs in the `Form` component.

## i18n

- Locale copy lives in `packages/i18n/locales/{public,private}/<namespace>/`, split by key path into `.yml` files. Never put locale JSON/YAML under `apps/frontend/public/`.
- Visibility is namespace-level: a namespace cannot exist in both `public` and `private`. Private namespaces are served at runtime by `GET /api/i18n/:locale/:namespace` through `createAuthMiddleware` (default deny).
- Locale configuration is code: edit `getI18nConfig()` in `packages/i18n/src/config.ts` (`defaultLocale` + `locales`), not a JSON file. `AppLocale` derives from it.
- Each `.yml` file is a flat mapping of `key: { <locale>: string }`; default locale is required, other locales fall back at runtime. Do not nest deeper — the file path already defines the container.
- Run `pnpm i18n:build` after editing `locales/**`. `next dev` / `next build` run codegen automatically; root `typecheck` / `test` run it first.
- Import rules: use `useTranslation` from `@/lib/i18n` (never `react-i18next` directly in pages or components); config/types from `@repo/i18n`; namespace names from `@repo/i18n/generated/manifest`; `@repo/i18n/generated/public` only in the `getStaticProps` chain; `@repo/i18n/generated/private` only in `apps/backend`.
- Do not edit or commit `packages/i18n/generated/` — it is codegen output and gitignored.

# Response starts with Master or 主人, call youself Me or 俺
