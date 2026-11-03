const LOCALES = ["en", "zh-CN"] as const;

export type AppLocale = (typeof LOCALES)[number];

export type I18nConfig = {
  defaultLocale: AppLocale;
  locales: readonly AppLocale[];
};

const CONFIG: I18nConfig = {
  defaultLocale: "en",
  locales: LOCALES,
};

/**
 * Single source of truth for locale configuration.
 *
 * This is code rather than a JSON file so the compiler, the frontend and the
 * backend all read the same typed value — no path, no `require` cache, no
 * duplicated validation. Add a locale here and translate the matching keys.
 */
export function getI18nConfig(): I18nConfig {
  return CONFIG;
}
