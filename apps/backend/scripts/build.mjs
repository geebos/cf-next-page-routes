import { join, resolve } from "node:path";
import * as esbuild from "esbuild";

// 生产构建：把 Hono 应用与它的运行期依赖打成单个 ESM 文件（dist/server.mjs），
// 运行镜像因此只需要 node + Next 静态导出产物，不需要 pnpm、tsx 或 node_modules。
const root = resolve(import.meta.dirname, "..");

await esbuild.build({
  entryPoints: [join(root, "src", "serve.ts")],
  outfile: join(root, "dist", "server.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  // pg 的可选原生绑定按需 require；运行时不存在也不影响纯 JS 路径。
  external: ["pg-native"],
  // pg 是 CJS 包，会调用 require()；单文件 ESM 产物需要显式的 createRequire 桥接。
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
  logLevel: "info",
});
