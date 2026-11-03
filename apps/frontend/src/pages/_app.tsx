import "@/styles/globals.css";
import { useEffect, useMemo } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { Layout } from "@/components/layout/layout";
import { warmupNetworkPermission } from "@/lib/api";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type AppLocale,
  type Messages,
} from "@/i18n/settings";

type PageProps = {
  locale?: AppLocale;
  messages?: Messages;
  fallbackMessages?: Messages;
};

const EMPTY_MESSAGES: Messages = {};

function App({ Component, pageProps }: AppProps<PageProps>) {
  const router = useRouter();
  const skipLayout = router.pathname === "/" || router.pathname === "/404";

  useEffect(() => {
    void warmupNetworkPermission();
  }, []);

  const locale: AppLocale =
    pageProps.locale && isSupportedLocale(pageProps.locale)
      ? pageProps.locale
      : DEFAULT_LOCALE;
  const messages = pageProps.messages ?? EMPTY_MESSAGES;
  const fallbackMessages = pageProps.fallbackMessages ?? EMPTY_MESSAGES;

  const i18n = useMemo(() => {
    const instance = i18next.createInstance();
    instance.use(initReactI18next).init({
      lng: locale,
      defaultNS: "common",
      supportedLngs: [...SUPPORTED_LOCALES],
      react: { useSuspense: false },
      resources: {
        [locale]: messages,
        [DEFAULT_LOCALE]: fallbackMessages,
      },
      fallbackLng: DEFAULT_LOCALE,
      interpolation: { escapeValue: false },
    });
    return instance;
  }, [locale, messages, fallbackMessages]);

  useEffect(() => {
    return () => {
      (i18n as { dispose?: () => void }).dispose?.();
    };
  }, [i18n]);

  // Single client entry for html[lang] (AppLocale as-is)
  useEffect(() => {
    const fromProps = pageProps.locale;
    const fromQuery = router.query.locale;
    const fromPath =
      router.pathname === "/404"
        ? router.asPath.split("/").filter(Boolean)[0]
        : undefined;
    const next =
      [fromProps, fromQuery, fromPath].find(isSupportedLocale) ??
      DEFAULT_LOCALE;
    document.documentElement.lang = next;
  }, [pageProps.locale, router.query.locale, router.pathname, router.asPath]);

  const tree = (
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  );

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      {skipLayout ? tree : <Layout>{tree}</Layout>}
    </>
  );
}

export default App;
