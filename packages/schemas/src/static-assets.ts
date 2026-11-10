// 部署模式与 assets 服务清单：构建脚本与后端共享的单一事实源。
// 资源域名提供两类文件：登记的公共媒体，以及 Next 的浏览器产物（`_next/`，
// 不含 `_next/data/`）。本模板暂未内置公共媒体，清单留空；加入媒体目录/文件时
// 在这里登记，构建脚本（裁剪 out/）与 assets 服务（白名单）会同时生效。

export const DEPLOY_MODES = ["assets", "site", "both"] as const;
export type DeployMode = (typeof DEPLOY_MODES)[number];

// 未设置时的一体部署：页面、JS/CSS、媒体、API 都在同一个进程里。
export const DEFAULT_DEPLOY_MODE: DeployMode = "both";

export type MediaStaticEntry = {
  path: string;
  kind: "dir" | "file";
};

// 公共媒体在静态根下的位置；目录按前缀匹配，文件按全等匹配。
export const MEDIA_STATIC_ENTRIES: readonly MediaStaticEntry[] = [];

export function isDeployMode(value: string): value is DeployMode {
  return (DEPLOY_MODES as readonly string[]).includes(value);
}

// 空值 → both（与一体部署一致）；非法值抛错，让构建与启动都直接失败。
export function parseDeployMode(value: string | undefined): DeployMode {
  const mode = (value ?? "").trim();
  if (mode === "") return DEFAULT_DEPLOY_MODE;
  if (!isDeployMode(mode)) {
    throw new Error(
      `DEPLOY_MODE must be one of ${DEPLOY_MODES.join(" | ")}, got "${mode}"`,
    );
  }
  return mode;
}

// 资源域名的唯一归一化：去空白与尾部斜杠，保证与路径拼接、以及 next 的
// assetPrefix 拿到同一个值（构建期与浏览器内联值同源）。
export function normalizeAssetsBaseUrl(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/+$/, "");
}

export function isMediaStaticPath(pathname: string): boolean {
  return MEDIA_STATIC_ENTRIES.some((entry) =>
    entry.kind === "dir"
      ? pathname === entry.path || pathname.startsWith(`${entry.path}/`)
      : pathname === entry.path,
  );
}

// Next 导出的浏览器产物（JS/CSS/manifest）全部落在 `_next/` 下，文件名带哈希，
// 与媒体一样由资源域名提供，站点产物里不再保留。
export const NEXT_ASSET_DIR = "_next";

// `_next/data/` 是客户端路由按路径取数的页面数据：它由 addBasePath 拼接、
// 不经过 next 的 assetPrefix，所以必须留在站点同源，绝不能进资源域名。
export const NEXT_DATA_DIR = "data";

const NEXT_ASSET_PREFIX = `/${NEXT_ASSET_DIR}`;
const NEXT_DATA_PREFIX = `${NEXT_ASSET_PREFIX}/${NEXT_DATA_DIR}`;

export function isNextAssetPath(pathname: string): boolean {
  if (!pathname.startsWith(`${NEXT_ASSET_PREFIX}/`)) return false;
  return (
    pathname !== NEXT_DATA_PREFIX && !pathname.startsWith(`${NEXT_DATA_PREFIX}/`)
  );
}

// assets 服务对外开放的白名单：公共媒体 + Next 浏览器产物（不含 _next/data）。
export function isAssetsStaticPath(pathname: string): boolean {
  return isMediaStaticPath(pathname) || isNextAssetPath(pathname);
}
