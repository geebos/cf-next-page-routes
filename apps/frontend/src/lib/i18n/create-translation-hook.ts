import { useEffect, useState } from "react";
import {
  useTranslation as useI18nextTranslation,
  type UseTranslationOptions,
} from "react-i18next";
import type { Namespace } from "i18next";
import {
  DEFAULT_LOCALE,
  resolveAppLocale,
  type AppLocale,
  type Messages,
} from "@repo/i18n";
import {
  createPrivateLocaleLoader,
  type I18nResourceStore,
} from "./private-loader";

type LoadState =
  | { key: string; status: "loading" | "ready" }
  | { key: string; status: "error"; error: Error };

export class I18nAccessError extends Error {
  readonly name = "I18nAccessError";

  constructor(
    readonly namespace: string,
    readonly status: 401 | 403,
  ) {
    super(`Missing permission for i18n namespace "${namespace}" (${status})`);
  }
}

export function normalizeNamespaces(namespaces?: Namespace): string[] {
  const list =
    namespaces === undefined
      ? ["common"]
      : typeof namespaces === "string"
        ? [namespaces]
        : namespaces;

  const result: string[] = [];
  for (const namespace of list) {
    if (typeof namespace !== "string" || namespace.length === 0) continue;
    if (!result.includes(namespace)) result.push(namespace);
  }
  return result;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function createTranslationHook(options: {
  privateApiBaseUrl: string;
  privateNamespaces: readonly string[];
  fetchBundle: (
    apiBaseUrl: string,
    locale: AppLocale,
    namespace: string,
    signal?: AbortSignal,
  ) => Promise<Messages>;
  fallbackLocale?: AppLocale;
}) {
  const privateSet = new Set(options.privateNamespaces);
  const fallbackLocale = options.fallbackLocale ?? DEFAULT_LOCALE;
  const loader = createPrivateLocaleLoader({
    fetchBundle: (locale, namespace, signal) =>
      options.fetchBundle(
        options.privateApiBaseUrl,
        locale,
        namespace,
        signal,
      ),
    fallbackLocale,
  });

  function useTranslation(
    namespaces?: Namespace,
    useOptions?: UseTranslationOptions<undefined>,
  ) {
    const i18next = useI18nextTranslation(namespaces, useOptions);
    const requested = normalizeNamespaces(namespaces);
    const privateRequested = requested.filter((namespace) =>
      privateSet.has(namespace),
    );
    const namespaceKey = privateRequested.join("|");
    const locale = resolveAppLocale(i18next.i18n.language);
    const requestKey = `${locale}:${namespaceKey}`;
    const [state, setState] = useState<LoadState | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
      if (!namespaceKey) return;

      const controller = new AbortController();
      setState({ key: requestKey, status: "loading" });

      loader
        .load(
          i18next.i18n,
          locale,
          namespaceKey.split("|"),
          controller.signal,
        )
        .then(() => {
          if (!controller.signal.aborted) {
            setState({ key: requestKey, status: "ready" });
          }
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setState({ key: requestKey, status: "error", error: toError(error) });
          }
        });

      return () => controller.abort();
    }, [i18next.i18n, locale, namespaceKey, requestKey, attempt]);

    const currentState = state?.key === requestKey ? state : null;

    // 无权限直接抛给上层 ErrorBoundary；不渲染 raw key / 默认文案。
    if (
      currentState?.status === "error" &&
      currentState.error instanceof I18nAccessError
    ) {
      throw currentState.error;
    }

    // 用实际 resource store 派生 ready，避免切换 namespace 时出现一帧 raw key；
    // 同时等默认 locale bundle 就位，保证部分翻译能 fallback。
    const allLoaded = privateRequested.every(
      (namespace) =>
        i18next.i18n.hasResourceBundle(locale, namespace) &&
        (locale === fallbackLocale ||
          i18next.i18n.hasResourceBundle(fallbackLocale, namespace)),
    );

    return {
      ...i18next,
      ready:
        i18next.ready &&
        (privateRequested.length === 0 ||
          (currentState?.status === "ready" && allLoaded)),
      error: currentState?.status === "error" ? currentState.error : null,
      retry: () => {
        setState({ key: requestKey, status: "loading" });
        setAttempt((value) => value + 1);
      },
    };
  }

  return {
    useTranslation,
    clear: (store: I18nResourceStore) => loader.clear(store),
  };
}
