# Merge Demo Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the 8 separate demo pages into a single demo page (`/`) and reduce the sidebar/tabbar navigation to two items: Demo and Todo (a placeholder page).

**Architecture:** The 8 existing demo page files (`buttons.tsx`, `badges.tsx`, `cards.tsx`, `forms.tsx`, `select.tsx`, `feedback.tsx`, `overlays.tsx`, `nav-data.tsx`) are consolidated into `src/pages/index.tsx` as stacked `<Section>` blocks. A new `src/pages/todo.tsx` shows a centered empty-state placeholder. `src/components/layout/navigate.tsx` is reduced from 8 nav items to 2.

**Tech Stack:** Next.js (Pages Router, `output: "export"`), React, TypeScript, Tailwind CSS, lucide-react icons.

## Global Constraints

- Next.js Pages Router with `trailingSlash: true` and `output: "export"` (static export) — all routes must be statically exportable.
- Existing demo pages use `<Page className="bg-secondary">` as their wrapper; the merged page must preserve this.
- Sections use the existing `<Section title=... description=...>` and `<Row label=...>` components from `src/components/showcase/section.tsx` — do not modify these components.
- Icons come from `lucide-react`.
- The existing `isActive(pathname, href)` helper in `navigate.tsx` normalizes trailing slashes, so `href: "/"` and `href: "/todo/"` both work without special handling.
- This is a merge/move task — section bodies are copied verbatim from their source files, not rewritten.

---

### Task 1: Add Todo placeholder page and reduce nav to 2 items

**Files:**
- Create: `src/pages/todo.tsx`
- Modify: `src/components/layout/navigate.tsx:1-42` (imports + `navItems` array)

**Interfaces:**
- Produces: `src/pages/todo.tsx` default-exports a React component rendered at `/todo/`.
- Produces: `navItems` in `navigate.tsx` now has exactly 2 entries: `{ title: "Demo", href: "/", icon: SparklesIcon }` and `{ title: "Todo", href: "/todo/", icon: ListTodoIcon }`.

- [ ] **Step 1: Create `src/pages/todo.tsx`**

Create the file with this exact content:

```tsx
import { ListTodoIcon } from "lucide-react";

import { Page } from "@/components/layout/page";

export default function TodoPage() {
  return (
    <Page className="bg-secondary">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32 text-center">
        <ListTodoIcon className="size-10 text-muted-foreground/40" />
        <h1 className="font-heading text-[28px] font-semibold tracking-tight text-foreground">
          Todo
        </h1>
        <p className="text-[15px] text-muted-foreground">Coming soon.</p>
      </div>
    </Page>
  );
}
```

- [ ] **Step 2: Update `src/components/layout/navigate.tsx` imports**

Replace the lucide-react import block (lines 15-25) with:

```tsx
import {
  SparklesIcon,
  ListTodoIcon,
  type LucideIcon,
} from "lucide-react";
```

This removes the 8 now-unused icons (`MousePointerIcon`, `TagIcon`, `SquareIcon`, `TextCursorInputIcon`, `ChevronDownIcon`, `MessageSquareIcon`, `LayersIcon`, `TablePropertiesIcon`) and adds the 2 new ones.

- [ ] **Step 3: Update `navItems` array in `navigate.tsx`**

Replace the `navItems` array (lines 33-42) with:

```tsx
export const navItems: NavItem[] = [
  { title: "Demo", href: "/", icon: SparklesIcon },
  { title: "Todo", href: "/todo/", icon: ListTodoIcon },
];
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS with no errors. (The 8 old demo pages still exist and still import their icons, so nothing is orphaned yet.)

- [ ] **Step 5: Run build**

Run: `pnpm build`
Expected: PASS. `/` still shows the old hero; `/todo/` shows the new placeholder; sidebar/tabbar shows 2 items.

- [ ] **Step 6: Commit**

```bash
git add src/pages/todo.tsx src/components/layout/navigate.tsx
git commit -m "feat(nav): reduce nav to Demo and Todo, add Todo placeholder page"
```

---

### Task 2: Merge all 8 demo pages into `src/pages/index.tsx`

**Files:**
- Modify: `src/pages/index.tsx` (full rewrite — currently 45 lines of hero content)

**Interfaces:**
- Consumes: the existing `<Section>` and `<Row>` components from `src/components/showcase/section.tsx`, the `<Page>` from `src/components/layout/page`, and all UI components already imported by the 8 source files.
- Produces: `src/pages/index.tsx` default-exports a client component that renders all 8 demo sections stacked vertically. The 8 source files still exist on disk after this task (they are deleted in Task 3) but are no longer linked from the nav.

- [ ] **Step 1: Write the new `src/pages/index.tsx`**

Replace the entire contents of `src/pages/index.tsx` with the file below. The structure is:

1. `"use client"` directive at the top (needed because `forms`/`select`/`overlays` use `useState`/`useForm`).
2. A combined import block (all imports from the 8 source files, deduped).
3. The `formSchema` and `pricingRows` module-level constants (from `forms.tsx` and `nav-data.tsx`).
4. The `Home` component, which returns `<Page className="bg-secondary">` containing 8 `<Section>` blocks in order.

For each `<Section>` block, copy the `<Section>...</Section>` content **verbatim** from the named source file. Do not modify any markup, classes, or logic inside the sections — only the surrounding file structure changes.

```tsx
"use client";

import { useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  PlusIcon,
  DownloadIcon,
  ArrowRightIcon,
  SettingsIcon,
  SaveIcon,
  CheckIcon,
  SparklesIcon,
  InfoIcon,
  TriangleAlertIcon,
  CircleCheckIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  CopyIcon,
  Trash2Icon,
  MoreHorizontalIcon,
  FilterIcon,
  StarIcon,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Select, type SelectOption } from "@/components/select";
import { Section, Row } from "@/components/showcase/section";
import { Page } from "@/components/layout/page";

// --- Module-level constants (from forms.tsx and nav-data.tsx) ---

const formSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  prompt: z
    .string()
    .min(20, "Prompt must be at least 20 characters.")
    .max(200, "Prompt must be at most 200 characters."),
  terms: z
    .boolean()
    .refine((v) => v === true, "You must accept the terms of service."),
  plan: z.enum(["free", "pro", "ent"], {
    error: "Select a plan.",
  }),
  temperature: z.number().min(0).max(100),
  notifications: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const modelOptions: SelectOption[] = [
  {
    value: "iphone-17-pro",
    label: "iPhone 17 Pro",
    description: "Titanium flagship",
  },
  {
    value: "airpods-4",
    label: "AirPods 4",
    description: "Active noise cancellation",
  },
  {
    value: "watch-series-11",
    label: "Apple Watch Series 11",
    description: "Health & fitness",
  },
  {
    value: "vision-pro",
    label: "Apple Vision Pro",
    description: "Spatial computing",
    disabled: true,
  },
];

const toneOptions: SelectOption[] = [
  { value: "natural", label: "Natural Titanium" },
  { value: "blue", label: "Blue Titanium" },
  { value: "white", label: "White Titanium" },
  { value: "black", label: "Black Titanium" },
];

const pricingRows = [
  { model: "iPhone 17 Pro", context: "256GB", input: "$1,099", output: "—" },
  { model: "iPhone 17 Pro Max", context: "256GB", input: "$1,199", output: "—" },
  { model: "iPhone 17", context: "128GB", input: "$799", output: "—" },
  { model: "iPhone 17 Plus", context: "128GB", input: "$899", output: "—" },
];

// --- Component ---

export default function Home() {
  const [singleModel, setSingleModel] = useState("iphone-17-pro");
  const [multiTones, setMultiTones] = useState<string[]>(["warm", "bright"]);
  const [sliderInDialog, setSliderInDialog] = useState<number[]>([25]);

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      email: "",
      prompt: "",
      terms: false,
      plan: "pro",
      temperature: 40,
      notifications: true,
    },
  });

  function onSubmit(data: FormValues) {
    toast.success("Form submitted", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-muted p-4 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Page className="bg-secondary">
      {/* 1. Buttons — copy the <Section>...</Section> block verbatim from src/pages/buttons.tsx */}
      {/* 2. Badges — copy the <Section>...</Section> block verbatim from src/pages/badges.tsx */}
      {/* 3. Cards — copy the <Section>...</Section> block verbatim from src/pages/cards.tsx */}
      {/* 4. Form controls — copy the <Section>...</Section> block verbatim from src/pages/forms.tsx
            (includes the <form> element and all Controller bindings) */}
      {/* 5. Select — copy the <Section>...</Section> block verbatim from src/pages/select.tsx
            (uses singleModel/multiTones state declared above) */}
      {/* 6. Feedback — copy the <Section>...</Section> block verbatim from src/pages/feedback.tsx */}
      {/* 7. Overlays — copy the <Section>...</Section> block verbatim from src/pages/overlays.tsx
            (uses sliderInDialog state declared above) */}
      {/* 8. Navigation & data — copy the <Section>...</Section> block verbatim from src/pages/nav-data.tsx */}
    </Page>
  );
}
```

**Execution detail for the section bodies:** For each of the 8 source files, open the file, copy everything inside the `<Page className="bg-secondary">...</Page>` wrapper (i.e. the `<Section>` block and its children), and paste it into the corresponding position in the new `index.tsx` where the comment marker is. Remove the comment marker after pasting. The `<Page>` wrapper is NOT copied — it already exists in the new file.

The order must be:
1. Buttons (from `buttons.tsx`)
2. Badges (from `badges.tsx`)
3. Cards (from `cards.tsx`)
4. Form controls (from `forms.tsx`) — this section contains a `<form onSubmit={form.handleSubmit(onSubmit)}>` element; the `onSubmit` function is declared in the component body above.
5. Select (from `select.tsx`) — references `singleModel`/`setSingleModel` and `multiTones`/`setMultiTones` declared in the component body above.
6. Feedback (from `feedback.tsx`)
7. Overlays (from `overlays.tsx`) — references `sliderInDialog`/`setSliderInDialog` declared in the component body above.
8. Navigation & data (from `nav-data.tsx`) — references `pricingRows` declared at module level above.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS. If it fails, the most likely cause is a missing import (cross-check the import block against the source files) or a state variable not being declared in the component body (the three pieces of local state — `singleModel`/`multiTones`/`sliderInDialog` — and the `form`/`onSubmit` are all declared above).

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: PASS. `/` now shows all 8 sections stacked. The 8 old page files still exist but are unreachable from the nav.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.tsx
git commit -m "feat(demo): merge 8 demo pages into a single stacked demo page"
```

---

### Task 3: Delete the 8 old demo page files

**Files:**
- Delete: `src/pages/buttons.tsx`
- Delete: `src/pages/badges.tsx`
- Delete: `src/pages/cards.tsx`
- Delete: `src/pages/forms.tsx`
- Delete: `src/pages/select.tsx`
- Delete: `src/pages/feedback.tsx`
- Delete: `src/pages/overlays.tsx`
- Delete: `src/pages/nav-data.tsx`

**Interfaces:**
- Consumes: Task 2 must be complete (all section content now lives in `index.tsx`).
- Produces: a clean `src/pages/` directory with only `_app.tsx`, `_document.tsx`, `index.tsx`, and `todo.tsx` as page files.

- [ ] **Step 1: Delete the 8 files**

Run:
```bash
rm src/pages/buttons.tsx src/pages/badges.tsx src/pages/cards.tsx src/pages/forms.tsx src/pages/select.tsx src/pages/feedback.tsx src/pages/overlays.tsx src/pages/nav-data.tsx
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS. (The deleted files were self-contained and nothing imports them — they were page entry points reached via routing, not modules.)

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: PASS. Verify the build output no longer lists `/buttons/`, `/badges/`, etc. as generated routes.

- [ ] **Step 4: Commit**

```bash
git add -A src/pages/
git commit -m "chore(demo): remove old per-category demo page files"
```

---

### Task 4: Final verification

**Files:** None modified.

- [ ] **Step 1: Run full build + typecheck**

Run:
```bash
pnpm typecheck && pnpm build
```
Expected: Both PASS.

- [ ] **Step 2: Manual visual check (dev server)**

Run: `pnpm dev:web` (in a separate terminal, or `pnpm dev` for full stack).

Open `http://localhost:3000/` and verify:
- The page shows all 8 demo sections stacked vertically, in order: Buttons, Badges, Cards, Form controls, Select, Feedback, Overlays, Navigation & data.
- Each section's title, description, and content match what was on its individual page before.
- The form in "Form controls" still submits and shows a toast.
- The selects in "Select" still open and change values.
- The dialog in "Overlays" still opens and the slider inside it still works.

Open `http://localhost:3000/todo/` and verify:
- A centered "Todo" heading with "Coming soon." subtitle and a muted list icon.

Check the sidebar (desktop) and tabbar (mobile):
- Exactly 2 items: Demo (sparkles icon) and Todo (list-checks icon).
- Clicking Demo navigates to `/` and highlights the item.
- Clicking Todo navigates to `/todo/` and highlights the item.

- [ ] **Step 3: Stop dev server**

Stop the dev server with Ctrl+C.

---

## Self-Review

**Spec coverage:**
- "Merge 8 demo pages into a single demo page" → Task 2 ✓
- "index.tsx becomes the demo page" → Task 2 ✓
- "Stacked sections, one long scrollable page" → Task 2 (8 `<Section>` blocks in `<Page>`) ✓
- "todo.tsx — centered empty-state placeholder" → Task 1 ✓
- "Delete 8 old page files" → Task 3 ✓
- "navItems reduced to 2: Demo (SparklesIcon, href '/') and Todo (ListTodoIcon, href '/todo/')" → Task 1 ✓
- "Remove 8 unused icon imports" → Task 1 ✓
- "index.tsx gains 'use client'" → Task 2 ✓
- "Local state (forms/select/overlays) moves into index.tsx" → Task 2 (singleModel, multiTones, sliderInDialog, form, onSubmit) ✓

**Placeholder scan:** No "TBD"/"TODO" markers in task steps. The section-body copy instructions reference exact source files and exact content boundaries — this is a precise merge operation, not a placeholder.

**Type consistency:** `navItems` type is unchanged (`NavItem[]`). `SelectOption` is imported from `@/components/select` (same source as `select.tsx`). `FormValues` is inferred from `formSchema` exactly as in `forms.tsx`. State variable names (`singleModel`, `multiTones`, `sliderInDialog`) match the names used in the source files being copied, so the verbatim section bodies compile without renaming.

No issues found. Plan is complete.
