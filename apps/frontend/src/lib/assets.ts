// 公共媒体（图片/视频）的可选独立域名，构建期由 NEXT_PUBLIC_ASSETS_BASE_URL 注入。
// NEXT_PUBLIC_ 前缀是硬性的：Next 只把这类变量内联进浏览器产物，静态导出与浏览器必须读到同一个值。
export const ASSETS_BASE_URL = (process.env.NEXT_PUBLIC_ASSETS_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

// 未配置时原样返回根相对路径（同源），配置后拼成 `${base}${path}`；base 可带路径前缀。
export function assetUrl(path: string): string {
  if (!ASSETS_BASE_URL) return path;
  return `${ASSETS_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
