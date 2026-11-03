import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/i18n/settings";
import { detectInitialLocale, getSiteUrl } from "@/lib/i18n-utils";

const labels: Record<AppLocale, string> = {
  en: "English",
  "zh-CN": "简体中文",
};

const SESSION_KEY = "locale-redirected";

export default function LanguageLandingPage() {
  const router = useRouter();
  const [autoLocale, setAutoLocale] = useState<AppLocale | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    void detectInitialLocale().then((detected) => {
      setAutoLocale(detected);
      void router.replace(`/${detected}/`).then(() => {
        sessionStorage.setItem(SESSION_KEY, "1");
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const siteUrl = getSiteUrl();

  return (
    <>
      <Head>
        <title>Select language</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={`${siteUrl}/${DEFAULT_LOCALE}/`} />
      </Head>
      <main>
        <h1>Select your language</h1>
        <nav aria-label="Language selection">
          {SUPPORTED_LOCALES.map((l) => (
            <p key={l}>
              <Link href={`/${l}/`}>{labels[l]}</Link>
            </p>
          ))}
        </nav>
        {autoLocale && <p>Redirecting to {labels[autoLocale]}…</p>}
      </main>
    </>
  );
}
