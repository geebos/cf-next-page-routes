import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getI18nProps, getLocaleStaticPaths } from "./i18n-static";
import type { Messages } from "@repo/i18n";

function namespaceMessages(messages: Messages, namespace: string): Messages {
  return messages[namespace] as Messages;
}

function context(locale: string) {
  return { params: { locale } };
}

describe("getI18nProps", () => {
  it("returns current and fallback resources for public namespaces", async () => {
    const props = await getI18nProps(context("zh-CN"), ["common", "todo"]);

    assert.ok(props);
    assert.equal(props.locale, "zh-CN");
    assert.equal(namespaceMessages(props.messages, "common").siteName, "示例");
    assert.equal(
      namespaceMessages(props.fallbackMessages, "common").siteName,
      "Example",
    );
    assert.equal(
      typeof props.fallbackMessages.todo,
      "object",
    );
  });

  it("falls back to default locale resources", async () => {
    const props = await getI18nProps(context("en"), ["common"]);

    assert.ok(props);
    assert.deepEqual(props.messages.common, props.fallbackMessages.common);
    assert.equal(namespaceMessages(props.messages, "common").siteName, "Example");
  });

  it("skips private namespaces instead of injecting them", async () => {
    const props = await getI18nProps(context("en"), ["common", "admin"]);

    assert.ok(props);
    assert.deepEqual(Object.keys(props.messages), ["common"]);
    assert.deepEqual(Object.keys(props.fallbackMessages), ["common"]);
  });

  it("throws for unknown namespaces", async () => {
    await assert.rejects(
      () => getI18nProps(context("en"), ["common", "unknown"]),
      /Unknown namespace "unknown"/,
    );
  });

  it("returns null for an unsupported locale", async () => {
    assert.equal(await getI18nProps(context("zh"), ["common"]), null);
  });
});

describe("getLocaleStaticPaths", () => {
  it("returns paths for each supported locale", async () => {
    const result = await getLocaleStaticPaths({} as never);

    assert.deepEqual(result, {
      paths: [{ params: { locale: "en" } }, { params: { locale: "zh-CN" } }],
      fallback: false,
    });
  });
});
