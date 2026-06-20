// Drizzle schema 占位。
// 表定义在此文件内联，db.ts 通过 `import * as schema` 传给 drizzle()，
// 让 WorkerDB 类型能推断出 query API。当前没有表，先留一个空导出。
// 新增表时用 `sqliteTable(...)` 定义并 export，无需改动 db.ts。
export {};
