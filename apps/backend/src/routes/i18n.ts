import { Hono } from "hono";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type Messages,
} from "@repo/i18n";
import { PRIVATE_RESOURCES } from "@repo/i18n/generated/private";
import { PRIVATE_NAMESPACES } from "@repo/i18n/generated/manifest";
import { createAuthMiddleware, type AuthResolver } from "../middleware/auth";
import type { AppEnv } from "../types";

const NAMESPACE_PATTERN = /^[A-Za-z0-9_-]+$/;

export function createI18nRoute(getAuthFromRequest: AuthResolver) {
  const route = new Hono<AppEnv>();

  route.use("/i18n/*", createAuthMiddleware(getAuthFromRequest));

  route.get("/i18n/:locale/:namespace", (c) => {
    const locale = c.req.param("locale");
    const namespace = c.req.param("namespace");

    if (!isSupportedLocale(locale) || !NAMESPACE_PATTERN.test(namespace)) {
      return c.json(
        { code: 400, message: "Invalid locale or namespace", data: null },
        400,
      );
    }

    if (!(PRIVATE_NAMESPACES as readonly string[]).includes(namespace)) {
      return c.json(
        { code: 404, message: "Locale namespace not found", data: null },
        404,
      );
    }

    // 请求 locale 没有该 namespace 时回退到默认 locale；整个 namespace 不存在才 404。
    const messages: Messages | undefined =
      PRIVATE_RESOURCES[locale]?.[namespace] ??
      PRIVATE_RESOURCES[DEFAULT_LOCALE]?.[namespace];

    if (!messages) {
      return c.json(
        { code: 404, message: "Locale namespace not found", data: null },
        404,
      );
    }

    c.header("Cache-Control", "private, no-store");
    return c.json(messages);
  });

  return route;
}
