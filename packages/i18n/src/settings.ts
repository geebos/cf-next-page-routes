import { getI18nConfig, type AppLocale } from "./config";

const { defaultLocale, locales } = getI18nConfig();

export const DEFAULT_LOCALE: AppLocale = defaultLocale;
export const SUPPORTED_LOCALES = locales;

export const PREFERRED_LOCALE_KEY = "preferred-locale";

export function isSupportedLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

/** Strict route/query locale: only exact supported values; no language-prefix fuzzy map. */
export function resolveAppLocale(queryLocale: unknown): AppLocale {
  return isSupportedLocale(queryLocale) ? queryLocale : DEFAULT_LOCALE;
}

export function normalizeLocale(value: string | undefined | null): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  if (isSupportedLocale(value)) return value;
  const language = value.split("-")[0];
  return locales.find((l) => l.split("-")[0] === language) ?? DEFAULT_LOCALE;
}
