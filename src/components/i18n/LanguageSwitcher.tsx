"use client";

import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LanguagesIcon, CheckIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SUPPORTED_LOCALES,
  PREFERRED_LOCALE_KEY,
} from "@/i18n/settings";
import { replacePathLocale } from "@/lib/i18n-utils";

type Props = {
  collapsed?: boolean;
};

export function LanguageSwitcher({ collapsed = false }: Props) {
  const router = useRouter();
  const { t } = useTranslation(["common"]);
  const currentLocale =
    typeof router.query.locale === "string" &&
    isSupportedLocale(router.query.locale)
      ? router.query.locale
      : DEFAULT_LOCALE;

  async function changeLocale(nextLocale: string) {
    if (!isSupportedLocale(nextLocale)) return;
    if (nextLocale === currentLocale) return;
    localStorage.setItem(PREFERRED_LOCALE_KEY, nextLocale);
    await router.push(replacePathLocale(router.asPath, nextLocale));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={t("common:language.label")}
          className={cn(
            "rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed
              ? "mx-auto size-8 p-0"
              : "w-full justify-start gap-2 py-2",
          )}
        >
          <LanguagesIcon className="size-4 shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {t(`common:language.${currentLocale}`)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {SUPPORTED_LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => void changeLocale(l)}
          >
            <span className="flex-1">{t(`common:language.${l}`)}</span>
            {l === currentLocale && <CheckIcon className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
