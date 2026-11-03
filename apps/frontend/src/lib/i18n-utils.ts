import { isTauri } from "@tauri-apps/api/core";
import { locale as getTauriLocale } from "@tauri-apps/plugin-os";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  PREFERRED_LOCALE_KEY,
  type AppLocale,
} from "@/i18n/settings";

export const LOCAL_URL_BASE = "https://local.invalid";

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|#|\/\/)/.test(href);
}

export function localizePath(href: string, locale: AppLocale): string {
  if (!href) return `/${locale}/`;
  if (isExternalHref(href)) return href;

  const url = new URL(
    href.startsWith("/") ? href : `/${href}`,
    LOCAL_URL_BASE,
  );
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  return `/${segments.join("/")}/${url.search}${url.hash}`;
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

/**
 * Detect the initial locale for the user. Priority:
 *   1. localStorage[PREFERRED_LOCALE_KEY] — explicit choice via LanguageSwitcher
 *   2. Tauri system locale (read-only, does NOT write to storage)
 *   3. DEFAULT_LOCALE
 *
 * Whether the app runs in Tauri affects detection but not setting — the
 * LanguageSwitcher always writes to storage regardless of environment.
 */
export async function detectInitialLocale(): Promise<AppLocale> {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(PREFERRED_LOCALE_KEY);
    if (stored && isSupportedLocale(stored)) return stored;
  }

  if (isTauri()) {
    try {
      const systemLocale = await getTauriLocale();
      if (systemLocale) return normalizeLocale(systemLocale);
    } catch {
      // ignore — fall through to default
    }
  }

  return DEFAULT_LOCALE;
}
