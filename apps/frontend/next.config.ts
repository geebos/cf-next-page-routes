import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";
import { compileLocales } from "@repo/i18n/compile";
import {
  DEFAULT_DEPLOY_MODE,
  normalizeAssetsBaseUrl,
  parseDeployMode,
  type DeployMode,
} from "@repo/schemas";

const distDir = process.env.NEXT_DIST_DIR || ".next";
const DEV_API_ORIGIN = process.env.DEV_API_ORIGIN || "http://localhost:8787";

// 与 src/lib/assets.ts 的 ASSETS_BASE_URL 同源同值：构建期都是这个变量。
function readAssetsBaseUrl(): string {
  return normalizeAssetsBaseUrl(process.env.NEXT_PUBLIC_ASSETS_BASE_URL);
}

export default function config(phase: string): NextConfig {
  if (
    phase === PHASE_DEVELOPMENT_SERVER ||
    phase === PHASE_PRODUCTION_BUILD
  ) {
    compileLocales();
  }

  // dev 始终同源提供 _next，只有生产构建才按部署模式决定产物落在哪里。
  const isBuild = phase === PHASE_PRODUCTION_BUILD;
  const deployMode: DeployMode = isBuild
    ? parseDeployMode(process.env.DEPLOY_MODE)
    : DEFAULT_DEPLOY_MODE;
  const assetsBaseUrl = readAssetsBaseUrl();

  // 部署模式先校验再编译：写错值时不必跑完整导出才报错。
  if (isBuild && deployMode === "site" && !assetsBaseUrl) {
    throw new Error(
      "DEPLOY_MODE=site 需要 NEXT_PUBLIC_ASSETS_BASE_URL：_next 与媒体都由资源域名提供",
    );
  }

  return {
    reactStrictMode: true,
    output: "export",
    trailingSlash: true,
    // 让 /api/* 在 dev 下不被 308 到 /api/*/，API 路径始终无尾斜杠。
    skipTrailingSlashRedirect: true,
    images: {
      unoptimized: true,
    },
    // site 产物只有页面：JS/CSS 走资源域名，因此浏览器产物必须由 assetPrefix 指过去。
    // _next/data 不经 assetPrefix，仍随页面走同源（见 @repo/schemas 的 isNextAssetPath）。
    assetPrefix: deployMode === "site" ? assetsBaseUrl : undefined,
    distDir,
    transpilePackages: ["@repo/lib", "@repo/schemas", "@repo/i18n"],
    // 静态导出不支持生产 rewrites；开发期把 /api/* 代理到本地 Hono。
    async rewrites() {
      if (process.env.NODE_ENV !== "development") return [];
      return {
        beforeFiles: [
          {
            source: "/api/:path*",
            destination: `${DEV_API_ORIGIN}/api/:path*`,
          },
        ],
      };
    },
  };
}
