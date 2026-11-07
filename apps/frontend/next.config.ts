import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";
import { compileLocales } from "@repo/i18n/compile";
import { MEDIA_STATIC_ENTRIES, parseDeployMode } from "@repo/schemas";

const distDir = process.env.NEXT_DIST_DIR || ".next";
const DEV_API_ORIGIN = process.env.DEV_API_ORIGIN || "http://localhost:8787";

export default function config(phase: string): NextConfig {
  if (
    phase === PHASE_DEVELOPMENT_SERVER ||
    phase === PHASE_PRODUCTION_BUILD
  ) {
    compileLocales();
  }

  // 部署模式先校验再编译：写错值时不必跑完整导出才报错。
  if (phase === PHASE_PRODUCTION_BUILD) {
    const deployMode = parseDeployMode(process.env.DEPLOY_MODE);
    if (
      deployMode === "site" &&
      MEDIA_STATIC_ENTRIES.length > 0 &&
      !(process.env.NEXT_PUBLIC_ASSETS_BASE_URL || "").trim()
    ) {
      throw new Error(
        "DEPLOY_MODE=site 需要 NEXT_PUBLIC_ASSETS_BASE_URL：site 产物不打包媒体",
      );
    }
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
