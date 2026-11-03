import type { AppLocale, Messages } from "@repo/i18n";
import { PRIVATE_NAMESPACES } from "@repo/i18n/generated/manifest";
import { ApiError, fetchPrivateLocale } from "@/lib/api";
import {
  createTranslationHook,
  I18nAccessError,
} from "./create-translation-hook";
import type { I18nResourceStore } from "./private-loader";

export function mapPrivateLocaleError(
  error: unknown,
  namespace: string,
): Error {
  if (error instanceof ApiError && (error.code === 401 || error.code === 403)) {
    return new I18nAccessError(namespace, error.code);
  }
  return error instanceof Error ? error : new Error(String(error));
}

async function fetchBundle(
  apiBaseUrl: string,
  locale: AppLocale,
  namespace: string,
  signal?: AbortSignal,
): Promise<Messages> {
  try {
    return await fetchPrivateLocale(apiBaseUrl, locale, namespace, signal);
  } catch (error) {
    throw mapPrivateLocaleError(error, namespace);
  }
}

const i18n = createTranslationHook({
  privateApiBaseUrl: "/api/i18n",
  privateNamespaces: PRIVATE_NAMESPACES,
  fetchBundle,
});

export const useTranslation = i18n.useTranslation;
export const clearPrivateI18n = i18n.clear;
export { I18nAccessError };
export type { I18nResourceStore };
