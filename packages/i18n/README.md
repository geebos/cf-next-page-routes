# @repo/i18n

Locale configuration, source files, path rules, and the build-time compiler shared by the frontend and backend.

本包**只**负责配置、文案源文件、路径规则和编译产物，不包含 React hook、HTTP 路由或私有资源分发。

## 目录结构

```text
packages/i18n/
├── locales/
│   ├── public/<namespace>/...    # 可进入前端静态产物
│   └── private/<namespace>/...   # 仅后端可读取，前端运行时按需请求
├── src/
│   ├── config.ts                 # 配置函数：defaultLocale + locales
│   ├── settings.ts               # DEFAULT_LOCALE / SUPPORTED_LOCALES / 校验
│   ├── types.ts                  # Messages / LocaleResources
│   ├── paths.ts                  # 文件路径 → namespace/container 解析
│   ├── compile.ts                # 编译器核心（Node only）
│   ├── watch.ts                  # codegen watcher
│   └── cli.ts                    # codegen 入口
└── generated/                    # gitignored，由 codegen 生成
    ├── manifest.ts               # PUBLIC_NAMESPACES / PRIVATE_NAMESPACES（仅名称）
    ├── public/index.ts           # 公共资源
    └── private/index.ts          # 私有资源，仅后端 import
```

`locales/` 下只允许 `public` 和 `private` 两个目录；第一层 namespace 不能同时出现在两边。需要混合可见性时拆成两个 namespace。

## 配置

locale 配置是代码而不是 JSON 文件，编译器、前端和后端读同一个类型化值：

```ts
// packages/i18n/src/config.ts
const LOCALES = ["en", "zh-CN"] as const;
export type AppLocale = (typeof LOCALES)[number];

export function getI18nConfig(): I18nConfig {
  return { defaultLocale: "en", locales: LOCALES };
}
```

新增 locale：在 `LOCALES` 里加一项，补齐对应 `.yml` 的翻译值，然后 `pnpm i18n:build`。`AppLocale` 字面量类型和编译器校验会自动跟随，无需改动别处。

## 路径 → key

设文件相对 `locales/` 的路径为 `<visibility>/<namespace>/<dir...>/<file>.yml`：

1. 文件直接位于 namespace 根目录且 stem 为 `_<namespace>`：容器为 `[namespace]`。
2. 否则容器为 `[namespace, ...dir, fileStem]`。
3. 文件内每个 key 追加到容器路径，得到最终 key。

| 源文件 | 最终 key |
|--------|----------|
| `public/home/_home.yml` + `title` | `home.title` |
| `public/home/hero.yml` + `title` | `home.hero.title` |
| `public/home/account/profile.yml` + `name` | `home.account.profile.name` |
| `public/demo/buttons.yml` + `title` | `demo.buttons.title` |
| `public/demo/buttons/row.yml` + `variants` | `demo.buttons.row.variants` |
| `private/admin/_admin.yml` + `title` | `admin.title` |

规则：

- `_<namespace>.yml` 只能出现在 namespace 根目录，且名字必须与 namespace 一致；子目录直接使用同名文件（`home/account.yml`），不写 `home/account/_account.yml`。
- 普通文件可以和同名目录共存（`buttons.yml` 与 `buttons/row.yml`），编译器负责合并；冲突会报错。
- namespace、目录、文件名和 key 使用 `[A-Za-z0-9_-]+`；目录与 namespace 不能以 `_` 开头。
- 支持任意深度，建议完整 key 最多 3 段（`namespace.group.key`）。

## 文件格式

每个文件必须是扁平的一层 mapping，value 是 locale map：

```yaml
title:
  en: Hero Title
  zh-CN: 主标题
```

- 默认 locale（`getI18nConfig().defaultLocale`）必须存在；其他 locale 可省略，运行时由 i18next `fallbackLng` 回退。
- locale map 不能为空，值必须是字符串；不允许数组或更深层嵌套。
- 文案值原样保留，支持 i18next interpolation / plural 语法。含 `:`、`#`、引号等字符时，YAML 序列化/手写需要用引号包裹，编译器按解析后的字符串处理。

## 生成命令

```bash
pnpm --filter @repo/i18n codegen    # 单次编译
pnpm --filter @repo/i18n dev        # watch locales/
pnpm i18n:build                     # 根目录快捷方式
```

生成物不提交到 git：

- `next dev` / `next build` 由 `apps/frontend/next.config.ts` 自动编译；
- `apps/frontend` 的 `dev` 同时启动本包 watcher；
- backend、根 `typecheck`、根 `test` 不加载 Next 配置，根脚本会先执行 `pnpm i18n:build`。

编译器会收集所有错误后一次性输出（文件路径 + key），任一错误都会让 codegen 失败。

## 生成物 import 规则

| 子路径 | 允许的消费者 |
|--------|--------------|
| `@repo/i18n` | 浏览器 / Node：settings、配置函数、类型 |
| `@repo/i18n/generated/manifest` | 前端与后端：仅 namespace 名称 |
| `@repo/i18n/generated/public` | 仅 `getStaticProps` 链路 |
| `@repo/i18n/generated/private` | 仅 `apps/backend` |
| `@repo/i18n/compile` | 仅 `next.config.ts`、CLI 和编译器测试（Node only） |

前端组件统一从 `@/lib/i18n` 导入 `useTranslation`；私有 namespace 由该 hook 按 manifest 自动加载。不要在组件中直接 import `react-i18next` 或私有资源。
