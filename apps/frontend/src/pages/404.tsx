import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type AppLocale,
} from "@repo/i18n";

const messages: Record<
  AppLocale,
  { title: string; description: string; home: string }
> = {
  en: {
    title: "Page not found",
    description: "The requested page could not be found.",
    home: "Return home",
  },
  "zh-CN": {
    title: "页面不存在",
    description: "找不到您访问的页面。",
    home: "返回首页",
  },
};

const subscribeToNothing = () => () => {};

function getLocaleFromPath(): AppLocale {
  const first = window.location.pathname.split("/").filter(Boolean)[0];
  return isSupportedLocale(first) ? first : DEFAULT_LOCALE;
}

function getServerLocale(): AppLocale {
  return DEFAULT_LOCALE;
}

export default function NotFoundPage() {
  const locale = useSyncExternalStore(
    subscribeToNothing,
    getLocaleFromPath,
    getServerLocale,
  );

  const m = messages[locale];
  return (
    <main className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <h1>{m.title}</h1>
      <p>{m.description}</p>
      <Link href={`/${locale}/`}>{m.home}</Link>
    </main>
  );
}
