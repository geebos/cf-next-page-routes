import { existsSync } from "node:fs";
import { cp, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  MEDIA_STATIC_ENTRIES,
  NEXT_ASSET_DIR,
  NEXT_DATA_DIR,
  normalizeAssetsBaseUrl,
  parseDeployMode,
  type DeployMode,
} from "@repo/schemas";

// 构建期把 next 的导出目录整理成「该部署模式的静态根」：
//   both   → 原样：页面 + _next + 媒体 + favicon
//   site   → 删掉媒体与 _next/static（都由资源域名提供），页面与 _next/data 保留
//   assets → 只保留媒体与 _next（去掉 _next/data），页面全部丢弃
// 三种模式共用同一个 out/ 与同一个 STATIC_ROOT，所以 Dockerfile 不需要按模式分支拷贝。
const packageRoot = resolve(import.meta.dirname, "..");
const outDir = join(packageRoot, "out");
const publicDir = join(packageRoot, "public");

// _next/data 是客户端路由同源取数的页面数据，不经 assetPrefix，必须留在站点。
const nextDir = join(outDir, NEXT_ASSET_DIR);
const nextStaticDir = join(nextDir, "static");
const nextDataDir = join(nextDir, NEXT_DATA_DIR);

async function main() {
  const mode = parseDeployMode(process.env.DEPLOY_MODE);
  const assetsBaseUrl = normalizeAssetsBaseUrl(
    process.env.NEXT_PUBLIC_ASSETS_BASE_URL,
  );

  if (mode === "both") {
    assertSiteArtifact(mode);
    report(mode, "out/ 保持全量导出");
    return;
  }

  if (mode === "site") {
    // 页面里的 JS/CSS 由 assetPrefix 指向资源域名，/_next/data 仍走同源。
    if (!assetsBaseUrl) {
      throw new Error(
        "DEPLOY_MODE=site 需要 NEXT_PUBLIC_ASSETS_BASE_URL：_next 与媒体都由资源域名提供",
      );
    }
    for (const entry of MEDIA_STATIC_ENTRIES) {
      await rm(join(outDir, entry.path), { recursive: true, force: true });
      assertAbsent(entry.path);
    }
    await rm(nextStaticDir, { recursive: true, force: true });
    assertSiteArtifact(mode);
    assertAbsent(`/${NEXT_ASSET_DIR}/static`);
    report(mode, "只余页面与 _next/data");
    return;
  }

  // assets：保留导出目录里的 _next（去掉 _next/data）与媒体，其余（页面、favicon 等）
  // 全部丢弃，out/ 就是资源域名的静态根。
  if (!existsSync(outDir)) {
    throw new Error(`找不到 ${outDir}，先跑 next build`);
  }
  await rm(nextDataDir, { recursive: true, force: true });
  for (const name of await readdir(outDir)) {
    if (name === NEXT_ASSET_DIR) continue;
    await rm(join(outDir, name), { recursive: true, force: true });
  }
  for (const entry of MEDIA_STATIC_ENTRIES) {
    await cp(join(publicDir, entry.path), join(outDir, entry.path), {
      recursive: true,
    });
    if (!existsSync(join(outDir, entry.path))) {
      throw new Error(`assets 模式缺少媒体：${entry.path}`);
    }
  }
  if (!existsSync(nextStaticDir)) {
    throw new Error(
      "assets 模式缺少 Next 浏览器产物（out/_next/static）：先跑 next build，再跑本脚本",
    );
  }
  assertAbsent(`/${NEXT_ASSET_DIR}/${NEXT_DATA_DIR}`);
  assertAbsent("/index.html");
  assertAbsent("/404.html");
  report(
    mode,
    MEDIA_STATIC_ENTRIES.length > 0
      ? "只余 _next（不含 data）与媒体"
      : "只余 _next（不含 data），没有声明的媒体",
  );
}

function assertSiteArtifact(mode: DeployMode) {
  for (const required of ["/index.html", "/404.html", "/_next"]) {
    if (!existsSync(join(outDir, required))) {
      throw new Error(
        `DEPLOY_MODE=${mode} 需要完整的站点导出，但缺少 out${required}：先跑 next build，再跑本脚本`,
      );
    }
  }
}

function assertAbsent(name: string) {
  if (existsSync(join(outDir, name))) {
    throw new Error(`DEPLOY_MODE 裁剪失败：out${name} 仍然存在`);
  }
}

function report(mode: DeployMode, summary: string) {
  console.log(`[static] DEPLOY_MODE=${mode}：${summary}（${outDir}）`);
}

main().catch((error) => {
  console.error(
    `[static] ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
