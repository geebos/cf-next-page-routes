import type { AppLocale, Messages } from "@repo/i18n";

export type I18nResourceStore = {
  hasResourceBundle(lng: string, ns: string): boolean;
  addResourceBundle(
    lng: string,
    ns: string,
    resources: Messages,
    deep?: boolean,
    overwrite?: boolean,
  ): void;
  removeResourceBundle(lng: string, ns: string): void;
};

export type BundleFetcher = (
  locale: AppLocale,
  namespace: string,
  signal?: AbortSignal,
) => Promise<Messages>;

export type PrivateLocaleLoader = {
  load(
    store: I18nResourceStore,
    locale: AppLocale,
    namespaces: readonly string[],
    signal?: AbortSignal,
  ): Promise<void>;
  clear(store?: I18nResourceStore): void;
};

function cacheKey(locale: AppLocale, namespace: string): string {
  return `${locale}:${namespace}`;
}

export function createPrivateLocaleLoader(options: {
  fetchBundle: BundleFetcher;
  fallbackLocale: AppLocale;
}): PrivateLocaleLoader {
  const { fetchBundle, fallbackLocale } = options;

  let generation = 0;
  const cache = new Map<string, Messages>();
  const inflight = new Map<
    string,
    { generation: number; promise: Promise<Messages> }
  >();
  const injected = new Set<string>();

  function fetchOnce(
    locale: AppLocale,
    namespace: string,
  ): Promise<Messages> {
    const key = cacheKey(locale, namespace);
    const cached = cache.get(key);
    if (cached) return Promise.resolve(cached);

    const pending = inflight.get(key);
    if (pending && pending.generation === generation) {
      return pending.promise;
    }

    const requestGeneration = generation;
    // 不把调用方的 AbortSignal 传给共享请求：多个组件可能复用同一请求，
    // 单个调用方 abort 不应让其他调用方失败（StrictMode 也会重放 effect）。
    // abort 只阻止本次注入；clear() 通过 generation 丢弃过期结果。
    const promise = fetchBundle(locale, namespace)
      .then((data) => {
        if (requestGeneration === generation) cache.set(key, data);
        return data;
      })
      .finally(() => {
        if (inflight.get(key)?.promise === promise) inflight.delete(key);
      });

    inflight.set(key, { generation: requestGeneration, promise });
    return promise;
  }

  async function ensure(
    store: I18nResourceStore,
    locale: AppLocale,
    namespace: string,
    signal: AbortSignal | undefined,
    requestGeneration: number,
  ): Promise<void> {
    const key = cacheKey(locale, namespace);
    if (signal?.aborted) return;
    if (store.hasResourceBundle(locale, namespace)) {
      injected.add(key);
      return;
    }

    const data = await fetchOnce(locale, namespace);
    if (signal?.aborted || requestGeneration !== generation) return;
    if (store.hasResourceBundle(locale, namespace)) {
      injected.add(key);
      return;
    }

    store.addResourceBundle(locale, namespace, data, true, true);
    injected.add(key);
  }

  async function load(
    store: I18nResourceStore,
    locale: AppLocale,
    namespaces: readonly string[],
    signal?: AbortSignal,
  ): Promise<void> {
    const requestGeneration = generation;
    const tasks = new Map<string, { locale: AppLocale; namespace: string }>();

    for (const namespace of namespaces) {
      const locales =
        locale === fallbackLocale ? [locale] : [locale, fallbackLocale];
      for (const targetLocale of locales) {
        const key = cacheKey(targetLocale, namespace);
        if (store.hasResourceBundle(targetLocale, namespace)) {
          injected.add(key);
          continue;
        }
        tasks.set(key, { locale: targetLocale, namespace });
      }
    }

    await Promise.all(
      [...tasks.values()].map((task) =>
        ensure(
          store,
          task.locale,
          task.namespace,
          signal,
          requestGeneration,
        ),
      ),
    );
  }

  function clear(store?: I18nResourceStore): void {
    generation += 1;
    cache.clear();
    inflight.clear();

    if (store) {
      for (const key of injected) {
        const separator = key.indexOf(":");
        const locale = key.slice(0, separator) as AppLocale;
        const namespace = key.slice(separator + 1);
        store.removeResourceBundle(locale, namespace);
      }
      injected.clear();
    }
  }

  return { load, clear };
}
