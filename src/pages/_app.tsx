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
  type AppLocale,
  type Messages,
} from "@/i18n/settings";

type PageProps = {
  locale: AppLocale;
  messages: Messages;
  fallbackMessages: Messages;
};

function App({ Component, pageProps }: AppProps<PageProps>) {
  const router = useRouter();
  const isLanguageLanding = router.pathname === "/";

  useEffect(() => {
    void warmupNetworkPermission();
  }, []);

  const i18n = useMemo(() => {
    const instance = i18next.createInstance();
    instance.use(initReactI18next).init({
      lng: pageProps.locale,
      defaultNS: "common",
      supportedLngs: [...SUPPORTED_LOCALES],
      react: { useSuspense: false },
      resources: {
        [pageProps.locale]: pageProps.messages,
        [DEFAULT_LOCALE]: pageProps.fallbackMessages,
      },
      fallbackLng: DEFAULT_LOCALE,
      interpolation: { escapeValue: false },
    });
    return instance;
  }, [pageProps.locale, pageProps.messages, pageProps.fallbackMessages]);

  useEffect(() => {
    return () => {
      (i18n as { dispose?: () => void }).dispose?.();
    };
  }, [i18n]);

  const tree = (
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  );

  if (isLanguageLanding) {
    return (
      <>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
          />
        </Head>
        {tree}
      </>
    );
  }

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <Layout>{tree}</Layout>
    </>
  );
}

export default App;
