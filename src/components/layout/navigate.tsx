import Link from "next/link";
import { useRouter } from "next/router";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
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
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { title: "Demo", href: "/", icon: SparklesIcon },
  { title: "Todo", href: "/todo/", icon: ListTodoIcon },
];

// `useRouter().pathname` returns the route without a trailing slash (e.g. "/buttons"),
// while navItems hrefs are stored with one (e.g. "/buttons/") per trailingSlash: true.
// Normalize both sides before comparing.
function isActive(pathname: string, href: string) {
  return pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      data-collapsed={collapsed}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed
          ? "flex-col gap-1 px-1 py-2 text-[10px] leading-none"
          : "gap-2 px-2 py-1.5 text-sm",
        active ? "text-primary" : "text-sidebar-foreground",
      )}
    >
      <Icon className={cn("shrink-0", collapsed ? "size-5" : "size-4")} />
      <span className={cn("truncate", collapsed && "max-w-full")}>{item.title}</span>
    </Link>
  );
}

export function Sidebar() {
  const { pathname } = useRouter();
  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between px-2">
        <span className="font-heading text-[17px] font-semibold tracking-tight">
          Apple
        </span>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <NavButton item={item} active={isActive(pathname, item.href)} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  );
}

export function Tabbar() {
  const { pathname } = useRouter();

  return (
    <nav
      aria-label="Primary"
      className="inset-x-0 flex items-stretch border-t border-border bg-background/95 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActiveItem = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActiveItem ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 transition-colors",
              isActiveItem
                ? "text-primary"
                : "text-muted-foreground/60 hover:text-foreground",
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] leading-none">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
