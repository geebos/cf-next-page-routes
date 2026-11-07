import { existsSync } from "node:fs";
import { cp, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  MEDIA_STATIC_ENTRIES,
  parseDeployMode,
  type DeployMode,
} from "@repo/schemas";

// 构建期把 next 的导出目录整理成「该部署模式的静态根」：
//   both   → 原样：页面 + _next + 媒体 + favicon
//   site   → 删掉媒体（由资源域名提供），页面与 JS/CSS 保留
//   assets → 只保留媒体，页面与 JS/CSS 全部丢弃
// 三种模式共用同一个 out/ 与同一个 STATIC_ROOT，所以 Dockerfile 不需要按模式分支拷贝。
const packageRoot = resolve(import.meta.dirname, "..");
const outDir = join(packageRoot, "out");
const publicDir = join(packageRoot, "public");

async function main() {
  const mode = parseDeployMode(process.env.DEPLOY_MODE);

  if (mode === "both") {
    assertSiteArtifact(mode);
    report(mode, "out/ 保持全量导出");
    return;
  }

  if (mode === "site") {
    // 清单为空时没有媒体需要拆出去，也就不必配置资源域名。
    const hasMedia = MEDIA_STATIC_ENTRIES.length > 0;
    if (hasMedia && !(process.env.NEXT_PUBLIC_ASSETS_BASE_URL || "").trim()) {
      throw new Error(
        "DEPLOY_MODE=site 需要 NEXT_PUBLIC_ASSETS_BASE_URL：site 产物不打包媒体，缺域名会得到一片 404",
      );
    }
    for (const entry of MEDIA_STATIC_ENTRIES) {
      await rm(join(outDir, entry.path), { recursive: true, force: true });
      assertAbsent(entry.path);
    }
    assertSiteArtifact(mode);
    report(mode, hasMedia ? "已移除媒体" : "没有声明的媒体，产物不变");
    return;
  }

  // assets：清空导出目录后从 public/ 复制媒体，out/ 就是资源域名的静态根。
  if (!existsSync(outDir)) {
    throw new Error(`找不到 ${outDir}，先跑 next build`);
  }
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const entry of MEDIA_STATIC_ENTRIES) {
    await cp(join(publicDir, entry.path), join(outDir, entry.path), {
      recursive: true,
    });
    if (!existsSync(join(outDir, entry.path))) {
      throw new Error(`assets 模式缺少媒体：${entry.path}`);
    }
  }
  assertAbsent("/index.html");
  assertAbsent("/_next");
  report(
    mode,
    MEDIA_STATIC_ENTRIES.length > 0
      ? "只余媒体"
      : "没有声明的媒体，静态根为空",
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
