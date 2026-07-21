import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { useRouter } from "next/router";
import { resolveAppLocale, type AppLocale } from "@/i18n/settings";
import { localizePath } from "@/lib/i18n-utils";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  locale?: AppLocale;
  children: ReactNode;
};

export function LocalizedLink({
  href,
  locale: requestedLocale,
  children,
  ...props
}: Props) {
  const router = useRouter();
  const locale = requestedLocale ?? resolveAppLocale(router.query.locale);
  return (
    <Link href={localizePath(href, locale)} {...props}>
      {children}
    </Link>
  );
}
