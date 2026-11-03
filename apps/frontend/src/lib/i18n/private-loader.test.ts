import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AppLocale, Messages } from "@repo/i18n";
import {
  createPrivateLocaleLoader,
  type I18nResourceStore,
} from "./private-loader";

type AddCall = {
  locale: string;
  namespace: string;
  data: Messages;
  deep?: boolean;
  overwrite?: boolean;
};

class MemoryStore implements I18nResourceStore {
  bundles = new Map<string, Messages>();
  addCalls: AddCall[] = [];
  removed: string[] = [];

  hasResourceBundle(locale: string, namespace: string): boolean {
    return this.bundles.has(`${locale}:${namespace}`);
  }

  addResourceBundle(
    locale: string,
    namespace: string,
    data: Messages,
    deep?: boolean,
    overwrite?: boolean,
  ): void {
    this.bundles.set(`${locale}:${namespace}`, data);
    this.addCalls.push({ locale, namespace, data, deep, overwrite });
  }

  removeResourceBundle(locale: string, namespace: string): void {
    this.removed.push(`${locale}:${namespace}`);
    this.bundles.delete(`${locale}:${namespace}`);
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function messages(namespace: string, locale: string): Messages {
  return { title: `${namespace}:${locale}` };
}

function createLoader() {
  const calls: Array<{ locale: AppLocale; namespace: string }> = [];
  const loader = createPrivateLocaleLoader({
    fallbackLocale: "en",
    fetchBundle: async (locale, namespace) => {
      calls.push({ locale, namespace });
      return messages(namespace, locale);
    },
  });
  return { loader, calls };
}

describe("private locale loader", () => {
  it("loads current and default locale bundles", async () => {
    const { loader, calls } = createLoader();
    const store = new MemoryStore();

    await loader.load(store, "zh-CN", ["admin"]);

    assert.deepEqual(calls, [
      { locale: "zh-CN", namespace: "admin" },
      { locale: "en", namespace: "admin" },
    ]);
    assert.deepEqual(store.bundles.get("zh-CN:admin"), {
      title: "admin:zh-CN",
    });
    assert.deepEqual(store.bundles.get("en:admin"), { title: "admin:en" });
  });

  it("does not fetch when the store already has both bundles", async () => {
    const { loader, calls } = createLoader();
    const store = new MemoryStore();
    store.addResourceBundle("zh-CN", "admin", {}, true, true);
    store.addResourceBundle("en", "admin", {}, true, true);
    store.addCalls = [];

    await loader.load(store, "zh-CN", ["admin"]);

    assert.deepEqual(calls, []);
    assert.deepEqual(store.addCalls, []);
  });

  it("deduplicates concurrent loads of the same locale:namespace", async () => {
    const pending = deferred<Messages>();
    let fetchCount = 0;
    const loader = createPrivateLocaleLoader({
      fallbackLocale: "en",
      fetchBundle: async (locale) => {
        fetchCount += 1;
        if (locale === "en") return messages("admin", "en");
        return pending.promise;
      },
    });
    const store = new MemoryStore();

    const first = loader.load(store, "zh-CN", ["admin"]);
    const second = loader.load(store, "zh-CN", ["admin"]);
    await Promise.resolve();
    pending.resolve(messages("admin", "zh-CN"));
    await Promise.all([first, second]);

    assert.equal(fetchCount, 2);
    assert.equal(store.addCalls.length, 2);
  });

  it("does not cache failures and allows retry", async () => {
    let attempts = 0;
    const loader = createPrivateLocaleLoader({
      fallbackLocale: "en",
      fetchBundle: async (locale, namespace) => {
        attempts += 1;
        if (attempts === 1) throw new Error("network down");
        return messages(namespace, locale);
      },
    });
    const store = new MemoryStore();

    await assert.rejects(() => loader.load(store, "en", ["admin"]), /network down/);
    assert.equal(store.addCalls.length, 0);

    await loader.load(store, "en", ["admin"]);
    assert.equal(attempts, 2);
    assert.deepEqual(store.bundles.get("en:admin"), { title: "admin:en" });
  });

  it("does not fail a later load when an earlier caller aborts", async () => {
    const pending = deferred<Messages>();
    let fetchCount = 0;
    const loader = createPrivateLocaleLoader({
      fallbackLocale: "en",
      fetchBundle: async () => {
        fetchCount += 1;
        return pending.promise;
      },
    });
    const store = new MemoryStore();

    const first = new AbortController();
    const firstLoad = loader.load(store, "en", ["admin"], first.signal);
    first.abort();

    const second = new AbortController();
    const secondLoad = loader.load(store, "en", ["admin"], second.signal);
    pending.resolve(messages("admin", "en"));
    await Promise.all([firstLoad, secondLoad]);

    assert.equal(fetchCount, 1);
    assert.deepEqual(store.bundles.get("en:admin"), { title: "admin:en" });
  });

  it("discards in-flight responses after clear()", async () => {
    const pending = deferred<Messages>();
    let fetchCount = 0;
    const loader = createPrivateLocaleLoader({
      fallbackLocale: "en",
      fetchBundle: async () => {
        fetchCount += 1;
        return pending.promise;
      },
    });
    const store = new MemoryStore();

    const loading = loader.load(store, "en", ["admin"]);
    await Promise.resolve();
    loader.clear();
    pending.resolve(messages("admin", "en"));
    await loading;

    assert.equal(store.addCalls.length, 0);

    await loader.load(store, "en", ["admin"]);
    assert.equal(fetchCount, 2);
  });

  it("clear(store) removes every injected private bundle", async () => {
    const { loader } = createLoader();
    const store = new MemoryStore();

    await loader.load(store, "zh-CN", ["admin"]);
    assert.equal(store.bundles.size, 2);

    loader.clear(store);

    assert.deepEqual(store.removed.sort(), ["en:admin", "zh-CN:admin"]);
    assert.equal(store.bundles.size, 0);
  });

  it("injects bundles with deep merge and overwrite", async () => {
    const { loader } = createLoader();
    const store = new MemoryStore();

    await loader.load(store, "en", ["admin"]);

    assert.deepEqual(store.addCalls, [
      {
        locale: "en",
        namespace: "admin",
        data: { title: "admin:en" },
        deep: true,
        overwrite: true,
      },
    ]);
  });
});
