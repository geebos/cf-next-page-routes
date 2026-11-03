import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  SparklesIcon,
  ListTodoIcon,
  FlaskConicalIcon,
  type LucideIcon,
} from "lucide-react";
import { resolveAppLocale, type AppLocale } from "@/i18n/settings";
import {
  LOCAL_URL_BASE,
  localizePath,
  stripLocalePrefix,
} from "@/lib/i18n-utils";
import { LocalizedLink } from "@/components/i18n/LocalizedLink";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export type NavItem = {
  titleKey: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { titleKey: "common:navigation.demo", href: "/", icon: SparklesIcon },
  { titleKey: "common:navigation.todo", href: "/todo/", icon: ListTodoIcon },
  { titleKey: "common:navigation.test", href: "/test/", icon: FlaskConicalIcon },
];

export function isActive(asPath: string, href: string) {
  const path = new URL(asPath, LOCAL_URL_BASE).pathname;
  return (
    stripLocalePrefix(path).replace(/\/$/, "") === href.replace(/\/$/, "")
  );
}

function useCurrentLocale(): AppLocale {
  const router = useRouter();
  return resolveAppLocale(router.query.locale);
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const { t } = useTranslation(["common"]);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const Icon = item.icon;
  return (
    <LocalizedLink
      href={item.href}
      data-collapsed={collapsed}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center rounded-md transition-colors",
        collapsed
          ? "flex-col gap-1 px-1 py-2 text-[10px] leading-none"
          : "gap-2 px-2 py-1.5 text-sm",
        active
          ? "bg-primary text-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className={cn("shrink-0", collapsed ? "size-3.5" : "size-4")} />
      <span className={cn("truncate", collapsed && "max-w-full")}>
        {t(item.titleKey)}
      </span>
    </LocalizedLink>
  );
}

export function Sidebar() {
  const { asPath } = useRouter();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader
        className={cn(
          "border-b border-sidebar-border px-2 py-3",
          collapsed ? "flex justify-center" : "flex-row items-center",
        )}
      >
        <span
          className={cn(
            "font-heading font-semibold tracking-tight",
            collapsed ? "text-sm" : "text-lg",
          )}
        >
          Apple
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <NavButton item={item} active={isActive(asPath, item.href)} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-2 py-2">
        <LanguageSwitcher collapsed={collapsed} />
        <SidebarTrigger className="w-full rounded-md py-2 hover:bg-sidebar-accent" />
      </SidebarFooter>
    </SidebarPrimitive>
  );
}

export function Tabbar() {
  const router = useRouter();
  const { asPath } = router;
  const currentLocale = useCurrentLocale();
  const { t } = useTranslation(["common"]);

  return (
    <nav
      aria-label="Primary"
      className="relative z-50 flex shrink-0 select-none items-stretch border-t border-border bg-background/95 backdrop-blur [touch-action:manipulation] md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActiveItem = isActive(asPath, item.href);
        return (
          <LocalizedLink
            key={item.href}
            href={item.href}
            aria-current={isActiveItem ? "page" : undefined}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" || isActiveItem) return;
              event.preventDefault();
              void router.push(localizePath(item.href, currentLocale));
            }}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 transition-colors",
              isActiveItem
                ? "text-primary"
                : "text-muted-foreground/60 hover:text-foreground",
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] leading-none">
              {t(item.titleKey)}
            </span>
          </LocalizedLink>
        );
      })}
    </nav>
  );
}
