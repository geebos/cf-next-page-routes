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
} from "@/i18n/settings";
import common from "../../public/locales/common.json";
import demo from "../../public/locales/demo.json";
import todo from "../../public/locales/todo.json";
import test from "../../public/locales/test.json";

type MergedMessages = Record<string, unknown>;
const MESSAGES: Record<string, MergedMessages> = {
  common,
  demo,
  todo,
  test,
};

export type StaticPageContext = GetStaticPropsContext<{
  locale?: string;
  [key: string]: string | string[] | undefined;
}>;

export type I18nProps = {
  locale: AppLocale;
  messages: Messages;
  fallbackMessages: Messages;
};

export function pickLocale(node: unknown, locale: AppLocale): Messages {
  if (node === null || typeof node !== "object")
    return node as unknown as Messages;
  if (Array.isArray(node))
    return node.map((item) => pickLocale(item, locale)) as unknown as Messages;

  const entries = Object.entries(node as Record<string, unknown>);
  const isLeaf =
    entries.length > 0 &&
    entries.every(
      ([k, v]) =>
        (SUPPORTED_LOCALES as readonly string[]).includes(k) &&
        typeof v === "string",
    );

  if (isLeaf) {
    const map = node as Record<string, string>;
    if (typeof map[locale] === "string") return map[locale] as unknown as Messages;
    if (typeof map[DEFAULT_LOCALE] === "string")
      return map[DEFAULT_LOCALE] as unknown as Messages;
    for (const l of SUPPORTED_LOCALES) {
      if (typeof map[l] === "string") return map[l] as unknown as Messages;
    }
    return undefined as unknown as Messages; // caller omits
  }

  const result: Messages = {};
  for (const [k, v] of entries) {
    const picked = pickLocale(v, locale);
    if (picked !== undefined) result[k] = picked;
  }
  return result;
}

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
    const merged = MESSAGES[ns];
    if (!merged) continue;
    const picked = pickLocale(merged, locale);
    messages[ns] = picked;
    fallbackMessages[ns] =
      locale === DEFAULT_LOCALE
        ? picked
        : pickLocale(merged, DEFAULT_LOCALE);
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
