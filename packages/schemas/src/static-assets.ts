// 部署模式与公共媒体清单：构建脚本与后端共享的单一事实源。
// 本模板暂未内置公共媒体，清单留空；加入媒体目录/文件时在这里登记，
// 构建脚本（裁剪 out/）与 assets 服务（白名单）会同时生效。

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

export function isMediaStaticPath(pathname: string): boolean {
  return MEDIA_STATIC_ENTRIES.some((entry) =>
    entry.kind === "dir"
      ? pathname === entry.path || pathname.startsWith(`${entry.path}/`)
      : pathname === entry.path,
  );
}
