# Todo app on `/todo` page

**Date:** 2026-06-22
**Branch:** `dev/todo-app`

## Goal

实现一个完整的 todo 应用，挂在 `/todo` 页面。顶部提交表单（任务、优先级、完成时间），底部按「优先级 + 完成时间」排序的 todo 列表，支持完成切换、编辑、删除。后端接 Cloudflare D1，schema 定义放 `src/shared/schemas/`，所有 request/response/zod 校验类型从 schema 派生。表单用 react-hook-form + zod，每个 form 在 `src/components/todo/` 里独立成组件后在页面中引用。

## 决策摘要

| 项 | 决策 |
|---|---|
| 优先级 | 三档枚举 `low` / `medium` / `high` |
| 「完成时间」语义 | 截止日期（due date），不是实际完成时间 |
| due date 精度 | 只到天 |
| due date 校验 | create 必填且禁止过去日期；edit 允许保留已有过去日期 |
| 任务字段约束 | 1–200 字符，trim 后非空 |
| 编辑范围 | task / priority / dueDate 都可改；completed 不在编辑弹窗改 |
| 完成操作 | 双向 toggle（可取消完成） |
| 删除确认 | 标准 AlertDialog（不显任务标题） |
| 操作反馈 | 成功 + 失败都弹 sonner toast |
| API 形状 | RESTful: `GET/POST /api/todos`, `PATCH/DELETE /api/todos/:id` |
| 排序 | 服务端 SQL `ORDER BY`，不用 JS 比较器 |
| 数据获取 | `useEffect + fetch + useState`，无 react-query / SWR 依赖 |
| D1 | 只跑通本地 miniflare D1，不动 `database_id`，不提交迁移文件 |
| 时间字段存储 | DB 列存**毫秒时间戳**（integer），前端创建/修改时把本地日期转时间戳提交 |
| schema 组织 | 方案 A：`src/shared/schemas/` 是目录，按域分文件（`todo.ts`）+ `index.ts` barrel，单一真源派生 |

## 架构

```
src/
├── shared/
│   └── schemas/
│       ├── index.ts          # export * from "./todo"
│       └── todo.ts           # 单一真源：zod schema + drizzle 表 + 派生类型
├── worker/
│   ├── db/
│   │   └── schema.ts         # 改为 export * from "@/shared/schemas"
│   └── routes/
│       └── todos.ts          # 新增：GET/POST/PATCH/DELETE /api/todos[/:id]
├── components/
│   └── todo/
│       ├── todo-form.tsx          # TodoForm（create + edit 共用）
│       ├── todo-edit-dialog.tsx   # TodoEditDialog（Dialog 包 TodoForm）
│       ├── todo-delete-dialog.tsx # TodoDeleteDialog（AlertDialog 确认）
│       └── todo-list.tsx          # TodoList（列表 + item 内联）
├── lib/
│   └── api.ts                # 新增：listTodos/createTodo/updateTodo/deleteTodo
└── pages/
    └── todo.tsx              # 改写：组合上述组件 + 状态管理
```

外加：`src/worker/index.ts` 加 `app.route("/api", todosRoute);`。

## 数据模型与 schema

### D1 表 `todos`（建在本地 miniflare D1）

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | `text PRIMARY KEY` | `crypto.randomUUID()` 生成 |
| `task` | `text NOT NULL` | 1–200 字符，trim 非空 |
| `priority` | `text NOT NULL DEFAULT 'medium'` | `'low' \| 'medium' \| 'high'` |
| `due_date` | `integer NOT NULL` | 毫秒时间戳（本地时区当天 00:00 的时间戳） |
| `completed` | `integer NOT NULL DEFAULT 0` | 0/1，SQLite 无 bool |
| `created_at` | `integer NOT NULL` | 毫秒时间戳，创建时写入 |
| `updated_at` | `integer NOT NULL` | 毫秒时间戳，每次更新写入 |

### `src/shared/schemas/todo.ts`（单一真源）

导出：

1. **zod**
   - `priorityEnum = z.enum(["low", "medium", "high"])`
   - `createTodoSchema`：`{ task: z.string().trim().min(1).max(200), priority: priorityEnum, dueDate: z.number().int().refine(n => n >= startOfTodayMs(), "不能选过去日期") }`
   - `updateTodoSchema`：全字段 optional（`task` 同约束、`priority`、`dueDate: z.number().int()` 不禁过去、`completed: z.boolean()`）
   - `todoSchema`（响应）：`{ id: z.string(), task: z.string(), priority: priorityEnum, dueDate: z.number().int(), completed: z.boolean(), createdAt: z.number().int(), updatedAt: z.number().int() }`
2. **drizzle**
   - `todos = sqliteTable("todos", { id: text("id").primaryKey(), task: text("task").notNull(), priority: text("priority").notNull().default("medium"), dueDate: integer("due_date").notNull(), completed: integer("completed").notNull().default(0), createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull() })`
3. **派生类型**
   - `Priority = z.infer<typeof priorityEnum>`
   - `Todo = z.infer<typeof todoSchema>`
   - `CreateTodoInput = z.infer<typeof createTodoSchema>`
   - `UpdateTodoInput = z.infer<typeof updateTodoSchema>`
4. **工具**（同文件内）
   - `startOfTodayMs()`：本地时区今天 00:00 的毫秒时间戳，供 create 校验用
   - `priorityRank`：`{ low: 1, medium: 2, high: 3 }`（仅在文档说明排序语义；SQL 里直接用 `CASE`）

### `src/shared/schemas/index.ts`

```ts
export * from "./todo";
```

### `src/worker/db/schema.ts`

改为：

```ts
export * from "@/shared/schemas";
```

`db.ts` middleware 的 `import * as schema` 与 `WorkerDB` 类型推断不变。

### 命名约定

- DB 列：snake_case（`due_date`、`created_at`、`updated_at`、`completed`）
- API 响应 / zod schema / TS 类型 / form 字段：camelCase（`dueDate`、`createdAt`、`updatedAt`、`completed`）
- worker 路由序列化时做一次映射：`{ id, task, priority, dueDate: row.due_date, completed: !!row.completed, createdAt: row.created_at, updatedAt: row.updated_at }`
- 前端全程 camelCase，不感知列名转换

## API

### 路由（`src/worker/routes/todos.ts`，挂到 `app.route("/api", todosRoute)`）

| 方法 & 路径 | body | 成功响应 | 说明 |
|---|---|---|---|
| `GET /api/todos` | — | `200 Todo[]`（已排序） | 服务端 SQL `ORDER BY` 排好序返回 |
| `POST /api/todos` | `createTodoSchema` | `201 Todo` | `id`=`crypto.randomUUID()`，`createdAt`/`updatedAt`=`Date.now()`，`completed`=0 |
| `PATCH /api/todos/:id` | `updateTodoSchema`（partial） | `200 Todo` | 更新时刷新 `updatedAt`；`completed` boolean→0/1；只改传入字段 |
| `DELETE /api/todos/:id` | — | `204` | 直接 `DELETE`，`changes`==0 抛 `BusinessError("任务不存在", 404)` |

### SQL 排序（`GET /api/todos`）

```ts
db.select().from(todos).orderBy(
  asc(todos.completed),                       // 未完成（0）在前
  sql`CASE ${todos.priority} WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC`,  // 高优先在前
  asc(todos.dueDate),                         // 早到期在前
  asc(todos.createdAt),                       // 稳定兜底
);
```

### 校验与错误

- 每个 handler `const parsed = schema.safeParse(await c.req.json());`，失败 `throw new BusinessError(parsed.error.issues[0]?.message ?? "参数错误", 400)`。
- 错误处理沿用现有 `BusinessError` → `{ code, message, data: null }` + 非 2xx 状态码。
- 成功响应：直接返回实体 JSON（`Todo` / `Todo[]`），DELETE 用 204 无 body。前端靠 `response.ok` 分流。

### `src/worker/index.ts` 改动

新增 `import { todosRoute } from "./routes/todos";` 与 `app.route("/api", todosRoute);`。其余不动。

## 前端

### 组件（`src/components/todo/`）

#### `todo-form.tsx` — `TodoForm`

- `useForm({ resolver: zodResolver(defaultValues ? updateTodoSchema : createTodoSchema) })`
- props: `{ defaultValues?: { task: string; priority: Priority; dueDate: number }; onSubmit: (input: CreateTodoInput | UpdateTodoInput) => Promise<void>; submitLabel: string; onCancel?: () => void; submitting?: boolean }`
- 字段控件（均用 `Controller` 绑定）：
  - `task`：`Input`
  - `priority`：`Select`（复用 `src/components/select.tsx`，options = `[{value:"low",label:"低"},{value:"medium",label:"中"},{value:"high",label:"高"}]`）
  - `dueDate`：`Popover` + `Calendar`（`react-day-picker` `mode="single"`）。create 态 `disabled={{ before: new Date() }}`；edit 态不禁。选中后用 `date-fns` `format(d, "yyyy-MM-dd")` 显示，form 里存的是**毫秒时间戳**（`d.getTime()` 或 `startOfDay(d).getTime()`，取本地时区当天 00:00 的时间戳）。
- create 态无 `onCancel`；edit 态有「取消」按钮（调 `onCancel`）。
- 提交按钮在 `submitting` 时 disable + 显示 `Spinner`，防重复提交。
- 校验错误用 `Field` + `FieldLabel` + `FieldError`（与 `src/pages/index.tsx` 的 form demo 一致）。

#### `todo-edit-dialog.tsx` — `TodoEditDialog`

- `Dialog`（受控 open，父组件管 `editingTodo` 是否非空）
- 内嵌 `TodoForm`，`defaultValues` 来自 `todo`（`{ task, priority, dueDate }`），`submitLabel="保存"`，`onCancel` = 关 dialog
- props: `{ todo: Todo; onSaved: () => void; onOpenChange: (open: boolean) => void }`
- `onSubmit` 内部调 `updateTodo(todo.id, input)`，成功后调 `onSaved()`（父组件负责 refetch + toast + 关 dialog）

#### `todo-delete-dialog.tsx` — `TodoDeleteDialog`

- `AlertDialog`（受控 open）
- 标准确认，不显任务标题
- props: `{ todo: Todo; onConfirm: () => Promise<void>; onOpenChange: (open: boolean) => void }`
- 确认按钮在 `pending` 时 disable + `Spinner`

#### `todo-list.tsx` — `TodoList`

- props: `{ todos: Todo[]; loading: boolean; error: string | null; onToggle: (t: Todo) => void; onEdit: (t: Todo) => void; onDelete: (t: Todo) => void; onRetry: () => void }`
- loading：显示 3 个 `Skeleton` 行
- 空：`Empty` 组件（已装），文案「还没有任务」
- error：文案 + 重试按钮（调 `onRetry`）
- item 布局（一行）：
  - 左：`Checkbox`（toggle `completed`，`checked={t.completed}`）
  - 任务文本（`completed` 时 `line-through text-muted-foreground`）
  - priority `Badge`：`high`=`destructive`、`medium`=`warning`（自配 className）、`low`=`secondary`
  - dueDate 文本（`date-fns` `format(new Date(t.dueDate), "yyyy-MM-dd")`）；`!completed && t.dueDate < startOfTodayMs()` 时加 `text-destructive` 表「已逾期」
  - 右：`Button` 编辑（ghost size icon，`PencilIcon`）+ `Button` 删除（ghost size icon，`Trash2Icon`）

### API client（`src/lib/api.ts`）

```ts
export async function listTodos(): Promise<Todo[]>
export async function createTodo(input: CreateTodoInput): Promise<Todo>
export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo>
export async function deleteTodo(id: string): Promise<void>
```

- 全部走相对路径 `/api/todos`、`/api/todos/${id}`
- `if (!res.ok)`：`throw new ApiError(message)`，`ApiError` 从 `{ code, message, data }` 取 message（fallback `请求失败`）
- `deleteTodo` 对 204 不读 body

### 页面 `src/pages/todo.tsx`（状态机）

- state：`todos: Todo[]`、`loading: boolean`、`error: string | null`、`editingTodo: Todo | null`、`deletingTodo: Todo | null`、`submitting: boolean`
- mount：`useEffect(() => { refresh(); }, [])`，`refresh = async () => { setLoading(true); try { setTodos(await listTodos()); } catch(e) { setError(...); } finally { setLoading(false); } }`
- handlers（每个 mutation 成功后 refetch + toast，失败 toast 且不改状态）：
  - `handleCreate(input)`：`await createTodo(input)` → `refresh()` → `toast.success("已添加")`；失败 `toast.error(e.message)`
  - `handleToggle(t)`：`await updateTodo(t.id, { completed: !t.completed })` → `refresh()` → `toast.success(t.completed ? "已取消完成" : "已完成")`
  - `handleUpdate(input)`（由 `TodoEditDialog` 内部调）：`await updateTodo(editingTodo.id, input)` → `setEditingTodo(null)` → `refresh()` → `toast.success("已保存")`
  - `handleDelete()`（由 `TodoDeleteDialog` 调）：`await deleteTodo(deletingTodo.id)` → `setDeletingTodo(null)` → `refresh()` → `toast.success("已删除")`
- 表单提交按钮在 `submitting` 时 disable

## 边界情况

1. **时区**：`startOfTodayMs()` 用本地时区今天 00:00 的时间戳（`new Date()` 取本地，`setHours(0,0,0,0)` 后 `getTime()`）。dueDate 存的是本地时区当天 00:00 的毫秒时间戳；显示时 `new Date(ts)` 用本地时区还原。后端不重算时间，原样存原样返。
2. **`crypto.randomUUID()`**：Worker 运行时有，直接用。
3. **并发**：mutation 后 refetch 串行（await 完再 refetch），不做乐观更新。多人场景不在本期范围。
4. **空表 first run**：本地 miniflare D1 没 `todos` 表 → `GET` 报错。建表用一次性 `wrangler d1 execute my-app-db --local --command="CREATE TABLE ..."`（写在下方「Setup 步骤」，不入 git）。如果 `GET` 报「no such table」，前端 error 文案提示「数据库未初始化」。
5. **PATCH partial 语义**：`updateTodoSchema` 全字段 optional，传什么改什么，不传的不动。`completed` 单独 PATCH 也合法（toggle 场景）。`updatedAt` 每次 PATCH 都刷新。
6. **DELETE 不存在的 id**：直接 `DELETE` 看 `changes`，=0 抛 `BusinessError("任务不存在", 404)`。
7. **路由注册**：`src/worker/index.ts` 加 `app.route("/api", todosRoute);`。
8. **shadcn 组件已装清单**（无需新增 install）：`dialog`、`alert-dialog`、`popover`、`calendar`、`checkbox`、`badge`、`button`、`input`、`skeleton`、`empty`、`label`、`field`、`spinner` —— 都在 `src/components/ui/` 里了。`select` 用 `src/components/select.tsx`（项目自封装的 Combobox 版）。

## Setup 步骤（本地一次性，不入 git）

```bash
wrangler d1 execute my-app-db --local --command="CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY, task TEXT NOT NULL, priority TEXT NOT NULL DEFAULT 'medium', due_date INTEGER NOT NULL, completed INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);"
```

## 验收标准

- [ ] `/todo` 页面顶部有提交表单（任务、优先级、完成时间三字段），校验生效（空任务、过去日期、超长任务会被拦）
- [ ] 提交后底部列表出现新任务，列表按「未完成在前 → 优先级降序 → dueDate 升序 → createdAt 升序」排序
- [ ] 列表每项可点 Checkbox 切换完成状态：完成后排到列表后面，任务文本划线置灰；再点切回未完成
- [ ] 编辑按钮弹 Dialog，可改 task/priority/dueDate，保存后列表刷新
- [ ] 删除按钮弹 AlertDialog，确认后删除并刷新，取消则不动
- [ ] 所有操作成功/失败都有 sonner toast
- [ ] 后端 `GET/POST/PATCH/DELETE /api/todos[/:id]` 全部可用，数据落本地 miniflare D1
- [ ] schema 定义在 `src/shared/schemas/todo.ts`，request/response/zod 类型全部从 schema 派生
- [ ] `src/worker/db/schema.ts` 改为转发 `@/shared/schemas`，`WorkerDB` 类型推断正常
- [ ] 每个 form 独立成组件（`TodoForm` / `TodoEditDialog` / `TodoDeleteDialog`），页面引用
- [ ] `pnpm typecheck` 通过，`pnpm lint` 通过
- [ ] `wrangler.jsonc` 的 `database_id` 未改动，无迁移文件入 git

## 不在范围

- 真实远程 D1 部署 / `database_id` 配置 / drizzle migrations 目录
- 用户认证、多用户、任务归属
- 子任务、标签、分类、提醒、重复任务
- 搜索、过滤、分页
- 乐观更新、离线缓存、react-query / SWR
- 实际完成时间记录（需求里「完成时间」=截止日期）
