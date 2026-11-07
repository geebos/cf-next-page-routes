import { getI18nConfig, type AppLocale } from "./config";

const { defaultLocale, locales } = getI18nConfig();

export const DEFAULT_LOCALE: AppLocale = defaultLocale;
export const SUPPORTED_LOCALES = locales;
// 默认语言使用无前缀 URL，只有其余语言才生成 /[locale]/ 路由。
export const PREFIXED_LOCALES = SUPPORTED_LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
);

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
