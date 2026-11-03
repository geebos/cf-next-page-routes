import type {
  GetStaticPaths,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
  type Messages,
} from "@repo/i18n";
import {
  PRIVATE_NAMESPACES,
  PUBLIC_NAMESPACES,
} from "@repo/i18n/generated/manifest";
import { PUBLIC_RESOURCES } from "@repo/i18n/generated/public";

export type StaticPageContext = GetStaticPropsContext<{
  locale?: string;
  [key: string]: string | string[] | undefined;
}>;

export type I18nProps = {
  locale: AppLocale;
  messages: Messages;
  fallbackMessages: Messages;
};

export function getLocaleFromContext(
  ctx: StaticPageContext,
): AppLocale | null {
  const locale = ctx.params?.locale;
  return isSupportedLocale(locale) ? locale : null;
}

export const getLocaleStaticPaths: GetStaticPaths = async () => ({
  paths: SUPPORTED_LOCALES.map((locale) => ({ params: { locale } })),
  fallback: false,
});

export async function getI18nProps(
  ctx: StaticPageContext,
  namespaces: string[],
): Promise<I18nProps | null> {
  const locale = getLocaleFromContext(ctx);
  if (!locale) return null;

  const messages: Messages = {};
  const fallbackMessages: Messages = {};

  for (const ns of namespaces) {
    // Private namespaces are loaded at runtime by the unified useTranslation hook.
    if ((PRIVATE_NAMESPACES as readonly string[]).includes(ns)) continue;

    if (!(PUBLIC_NAMESPACES as readonly string[]).includes(ns)) {
      throw new Error(`[i18n] Unknown namespace "${ns}"`);
    }

    messages[ns] = PUBLIC_RESOURCES[locale]?.[ns] ?? {};
    fallbackMessages[ns] = PUBLIC_RESOURCES[DEFAULT_LOCALE]?.[ns] ?? {};
  }

  return { locale, messages, fallbackMessages };
}

export function makeStaticProps(namespaces: string[]) {
  return async (
    ctx: StaticPageContext,
  ): Promise<GetStaticPropsResult<I18nProps>> => {
    const props = await getI18nProps(ctx, namespaces);
    if (!props) return { notFound: true as const };
    return { props };
  };
}

export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
