import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type AppLocale,
} from "@repo/i18n";

export const LOCAL_URL_BASE = "https://local.invalid";

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|#|\/\/)/.test(href);
}

// 给站内路径加上/替换 locale 前缀（默认语言无前缀），并保留查询串与 hash。
export function localizePath(href: string, locale: AppLocale): string {
  if (isExternalHref(href)) return href;

  const url = new URL(
    href.startsWith("/") ? href : `/${href}`,
    LOCAL_URL_BASE,
  );
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    segments.shift();
  }

  const pathname = segments.length === 0 ? "" : `/${segments.join("/")}`;
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  return `${prefix}${pathname}/${url.search}${url.hash}`;
}

export function stripLocalePrefix(path: string): string {
  if (isExternalHref(path)) return path;
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    LOCAL_URL_BASE,
  );
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isSupportedLocale(segments[0])) segments.shift();
  const pathname = segments.length === 0 ? "/" : `/${segments.join("/")}`;
  return `${pathname}${url.search}${url.hash}`;
}

export function replacePathLocale(
  currentPath: string,
  nextLocale: AppLocale,
): string {
  return localizePath(currentPath, nextLocale);
}

/**
 * The configured site base URL (env NEXT_PUBLIC_BASE_URL).
 * Format: "schema://domain" — no path, no trailing slash. Port allowed.
 *
 * Returns "" in dev when unset (web falls back to relative paths, Tauri
 * falls back to DEFAULT_TAURI_BASE_URL in api.ts). Throws in production
 * when unset or malformed, so misconfiguration fails the build loud.
 */
export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BASE_URL?.trim() ?? "";
  if (url) {
    if (!/^https?:\/\/[^/]+$/.test(url)) {
      throw new Error(
        `NEXT_PUBLIC_BASE_URL must be in format "schema://domain" (no path, no trailing slash). Got: ${url}`,
      );
    }
    return url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_BASE_URL must be set for production build");
  }
  return "";
}

/**
 * Absolute site URL for SEO canonical/hreflang. Falls back to
 * "https://example.com" in dev so canonical links are always absolute.
 */
export function getSiteUrl(): string {
  return getBaseUrl() || "https://example.com";
}
