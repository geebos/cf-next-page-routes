import Head from "next/head";
import { useRouter } from "next/router";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/i18n/settings";
import { getSiteUrl, LOCAL_URL_BASE, stripLocalePrefix } from "@/lib/i18n-utils";

type SeoProps = {
  title: string;
  description: string;
  path: string;
};

const SITE_URL = getSiteUrl();

function createLocalizedUrl(locale: AppLocale, path: string) {
  const stripped = stripLocalePrefix(path);
  const url = new URL(stripped, LOCAL_URL_BASE);
  const segments = url.pathname.split("/").filter(Boolean);
  const pathname = segments.length === 0 ? "" : `/${segments.join("/")}`;
  return `${SITE_URL}/${locale}${pathname}/`;
}

export function Seo({ title, description, path }: SeoProps) {
  const router = useRouter();
  const locale =
    typeof router.query.locale === "string" &&
    isSupportedLocale(router.query.locale)
      ? router.query.locale
      : DEFAULT_LOCALE;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={createLocalizedUrl(locale, path)} />
      {SUPPORTED_LOCALES.map((alt) => (
        <link
          key={alt}
          rel="alternate"
          hrefLang={alt}
          href={createLocalizedUrl(alt, path)}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={createLocalizedUrl(DEFAULT_LOCALE, path)}
      />
    </Head>
  );
}
