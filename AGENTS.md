# 1. Project Structure

```txt
apps/
├── frontend/           # Next.js static export (Pages Router)
│   ├── src/
│   │   ├── pages/      # Page routes, organized by route
│   │   │   ├── _app.tsx        # Injects global Layout and globals.css
│   │   │   ├── _document.tsx   # HTML skeleton
│   │   │   ├── index.tsx       # Default-locale home page (reuses [locale]/index)
│   │   │   └── [locale]/       # Localized route tree (non-default locales)
│   │   ├── components/
│   │   │   ├── ui/     # shadcn/ui component library, do not edit directly
│   │   │   ├── layout/ # Layout / Page / Navigate
│   │   │   └── pages/  # Page-specific components
│   │   │       └── <page>/    # Create only when the page has components worth extracting
│   │   │           ├── *.tsx  # Complex or independently meaningful page-specific components
│   │   │           └── forms/ # Form components for the page
│   │   │               └── <name>-form.tsx
│   │   ├── hooks/      # React hooks
│   │   ├── lib/        # Frontend utilities; api.ts is the only API entry; i18n/ is the translate hook; assets.ts builds media URLs
│   │   └── styles/     # Global styles / Tailwind theme
│   ├── public/         # Static assets (locale copy lives in @repo/i18n)
│   ├── next.config.ts  # Static export + DEPLOY_MODE trimming + dev proxy + i18n codegen
│   └── components.json # shadcn config
├── backend/            # Hono API + static site
│   ├── src/
│   │   ├── index.ts    # App factory; imports routes centrally
│   │   ├── serve.ts    # Node entry (@hono/node-server): static + /api/* + PostgreSQL
│   │   ├── routes/     # Routes split by domain, as files or directories
│   │   ├── middleware/ # Backend middleware
│   │   ├── db/         # pg connection + repository (schema from @repo/db)
│   │   └── lib/        # static-site, static-assets, errors, validators
│   └── scripts/build.mjs # esbuild single-file build (dist/server.mjs)
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

Deployment files: `Dockerfile`, `docker-compose.yml`, `docker-compose.assets.yml`, `deploy/nginx.conf`.

# 2. Project Rules

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

## Backend

- Organize routes by domain under `apps/backend/src/routes/` and mount them centrally in `apps/backend/src/index.ts`.

## Deployment

- `pnpm build` exports to `apps/frontend/out/` and trims it by `DEPLOY_MODE` (`both` / `site` / `assets`); media paths live in `packages/schemas/src/static-assets.ts`.
- `apps/backend/src/serve.ts` serves `STATIC_ROOT` + `/api/*`; `assets` mode serves only the media whitelist and skips PostgreSQL.
- Public media URLs go through `assetUrl()` with `NEXT_PUBLIC_ASSETS_BASE_URL`; do not hardcode media origins.

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
