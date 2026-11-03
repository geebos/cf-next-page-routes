"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Page } from "@/components/layout/page";
import { Seo } from "@/components/i18n/Seo";
import { Section } from "@/components/ui/section";
import {
  RequestForm,
  type RequestPayload,
} from "@/components/pages/test/forms/request-form";
import {
  ResponseViewer,
  type ResponseData,
} from "@/components/pages/test/response-viewer";
import { request } from "@/lib/adapter/request";
import { getLocaleStaticPaths, makeStaticProps } from "@/lib/i18n-static";

export default function TestPage() {
  const { t } = useTranslation(["common", "test"]);
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<ResponseData | null>(null);

  async function handleSubmit({ method, url, headers }: RequestPayload) {
    if (!url) {
      toast.error(t("test:toast.urlRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await request(url, { method, headers });
      const headerMap: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headerMap[key] = value;
      });
      const body = await res.text();
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: headerMap,
        body,
      });
    } catch (e) {
      const msg =
        e instanceof Error && e.message ? e.message : t("test:toast.requestFailed");
      toast.error(msg);
      setResponse({
        status: 0,
        statusText: "Error",
        headers: {},
        body: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <Seo
        title={t("test:metaTitle")}
        description={t("test:metaDescription")}
        path="/test"
      />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
        <header>
          <h1 className="font-heading text-[28px] font-semibold tracking-tight">
            {t("test:title")}
          </h1>
        </header>

        <Section className="sticky top-[env(safe-area-inset-top,0px)] z-10 rounded-lg border border-border bg-card p-4">
          <RequestForm loading={loading} onSubmit={handleSubmit} />
        </Section>

        <Section>
          {response ? (
            <ResponseViewer data={response} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {t("test:empty")}
            </div>
          )}
        </Section>
      </div>
    </Page>
  );
}

export const getStaticPaths = getLocaleStaticPaths;
export const getStaticProps = makeStaticProps(["common", "test"]);
