// Worker 的 schema 入口：转发到前后端共享的 schema 目录。
// db.ts 通过 `import * as schema` 拿到所有表定义，WorkerDB 类型据此推断。
// 新增域时在 src/shared/schemas/ 下加文件并在 index.ts 转发，无需改这里。
export * from "@/shared/schemas";
