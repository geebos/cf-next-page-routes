import type { AppLocale } from "./config";

export type Messages = { [key: string]: string | Messages };

export type LocaleResources = Record<
  AppLocale,
  { [namespace: string]: Messages }
>;
