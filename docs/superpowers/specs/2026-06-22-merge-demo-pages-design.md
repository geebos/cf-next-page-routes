# Merge demo pages and reduce nav to Demo + Todo

**Date:** 2026-06-22
**Branch:** `dev/page-background-wrapper`

## Goal

Merge the 8 separate demo pages (`buttons`, `badges`, `cards`, `forms`, `select`, `feedback`, `overlays`, `nav-data`) into a single demo page. Reduce the sidebar/tabbar navigation to two items: **Demo** and **Todo**. The Todo page is a centered "coming soon"-style empty-state placeholder.

## Architecture & file changes

### 1. `src/pages/index.tsx` — becomes the demo page

Replaces the current hero landing page. Renders all 8 demo sections stacked vertically, in their existing order, each keeping its own `<Section title=... description=...>` wrapper so the visual structure (title + description + card of rows) is preserved exactly as it is today. The body of each section is copied verbatim from its current page file.

Page wrapper stays `<Page className="bg-secondary">` to match the current demo pages.

Sections in order:
1. Buttons
2. Badges
3. Cards
4. Form controls
5. Select
6. Feedback
7. Overlays
8. Navigation & data display

Because the merged page uses client hooks (from `forms`/`select`/`overlays`), `index.tsx` gains `"use client"` at the top. The current hero `index.tsx` doesn't need it, but the merged version does.

### 2. `src/pages/todo.tsx` — new placeholder page

A centered empty-state: a `<Page>` with content vertically and horizontally centered, showing a small muted icon, a heading "Todo", and a muted subtitle like "Coming soon." Styled to match the muted-foreground/text patterns already in the codebase. No interactive elements.

### 3. Deleted page files

- `src/pages/buttons.tsx`
- `src/pages/badges.tsx`
- `src/pages/cards.tsx`
- `src/pages/forms.tsx`
- `src/pages/select.tsx`
- `src/pages/feedback.tsx`
- `src/pages/overlays.tsx`
- `src/pages/nav-data.tsx`

Their content moves into `index.tsx`. Files removed.

### 4. `src/components/layout/navigate.tsx` — nav reduced to 2 items

`navItems` becomes:

```ts
export const navItems: NavItem[] = [
  { title: "Demo", href: "/", icon: SparklesIcon },
  { title: "Todo", href: "/todo/", icon: ListTodoIcon },
];
```

The `demo` item uses `href: "/"` (no trailing slash) because that's what `index.tsx` maps to. The existing `isActive()` helper normalizes trailing slashes on both sides, so it handles `/` vs `/todo/` comparison correctly.

Unused icon imports (`MousePointerIcon`, `TagIcon`, `SquareIcon`, `TextCursorInputIcon`, `ChevronDownIcon`, `MessageSquareIcon`, `LayersIcon`, `TablePropertiesIcon`) are removed; `SparklesIcon` and `ListTodoIcon` added.

## What does NOT change

- `src/components/layout/layout.tsx` — no changes
- `src/components/showcase/section.tsx` — unchanged, still used by the demo page
- `src/components/layout/page.tsx` — unchanged
- The sidebar's "Apple" header label in `navigate.tsx` — unchanged
- All UI components, the select component, hooks, worker code — untouched

## Data flow

Static content only. No state shared between sections except what each section already manages internally (e.g. `forms` has its `useForm`, `select` has its `useState`, `overlays` has its dialog slider state). Those local hooks move into `index.tsx` as local component state, exactly as they were in their original files.

## Error handling

None required — purely presentational.

## Testing / verification

- `npm run build` (or `npm run dev`) — verify the app builds with no errors
- Manual check: sidebar shows 2 items, clicking Demo shows all 8 sections stacked, clicking Todo shows the centered placeholder
- Mobile: tabbar shows 2 items, both reachable

## Scope

Focused, single-axis change: consolidate pages + trim nav. No new abstractions, no new components, no speculative features.
