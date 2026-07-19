import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type AppLocale,
} from "@/i18n/settings";

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

export default function NotFoundPage() {
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const first = window.location.pathname.split("/").filter(Boolean)[0];
    if (isSupportedLocale(first)) setLocale(first);
  }, []);

  const m = messages[locale];
  return (
    <main>
      <h1>{m.title}</h1>
      <p>{m.description}</p>
      <Link href={`/${locale}/`}>{m.home}</Link>
    </main>
  );
}
