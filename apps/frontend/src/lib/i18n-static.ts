import type {
  GetStaticPaths,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  PREFIXED_LOCALES,
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

// 默认语言走无前缀路由，只有其余语言生成 /[locale]/* 页面。
export const getLocaleStaticPaths: GetStaticPaths = async () => ({
  paths: PREFIXED_LOCALES.map((locale) => ({ params: { locale } })),
  fallback: false,
});

export async function getI18nPropsForLocale(
  locale: AppLocale,
  namespaces: string[],
): Promise<I18nProps> {
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

export async function getI18nProps(
  ctx: StaticPageContext,
  namespaces: string[],
): Promise<I18nProps | null> {
  const locale = getLocaleFromContext(ctx);
  return locale ? getI18nPropsForLocale(locale, namespaces) : null;
}

export function makeStaticProps(
  namespaces: string[],
  forcedLocale?: AppLocale,
) {
  return async (
    ctx: StaticPageContext,
  ): Promise<GetStaticPropsResult<I18nProps>> => {
    // 根页面没有 params.locale，由调用方强制默认语言。
    const locale = forcedLocale ?? getLocaleFromContext(ctx);
    if (!locale) return { notFound: true as const };
    return { props: await getI18nPropsForLocale(locale, namespaces) };
  };
}

export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
