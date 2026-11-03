import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";
import { compileLocales } from "@repo/i18n/compile";

const distDir = process.env.NEXT_DIST_DIR || '.next'

export default function config(phase: string): NextConfig {
  if (
    phase === PHASE_DEVELOPMENT_SERVER ||
    phase === PHASE_PRODUCTION_BUILD
  ) {
    compileLocales();
  }

  return {
    reactStrictMode: true,
    output: "export",
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    distDir,
    transpilePackages: ["@repo/lib", "@repo/schemas", "@repo/i18n"],
    async rewrites() {
      return {
        beforeFiles: [
          {
            source: "/api/:path*",
            destination: "http://localhost:8787/api/:path*",
          },
        ],
      };
    },
  };
}
