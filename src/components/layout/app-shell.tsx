import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";
import { navItems, type NavItem } from "./nav-items";

// Collapsed sidebar shows icon stacked over smaller label, so it needs more
// width than shadcn's default 3rem (which only fits a square icon).
const SIDEBAR_WIDTH_ICON = "4.5rem";

// Strip the leading "#" from href to get a section id.
const sectionIds = navItems.map((item) => item.href.slice(1));

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      data-collapsed={collapsed}
      aria-current={active ? "true" : undefined}
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
    </a>
  );
}

function AppSidebar() {
  const activeId = useActiveSection(sectionIds);
  return (
    <Sidebar collapsible="icon">
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
                  <NavButton item={item} active={item.href.slice(1) === activeId} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function BottomNav() {
  const activeId = useActiveSection(sectionIds);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href.slice(1) === activeId;
        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground/60 hover:text-foreground",
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] leading-none">{item.title}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <div className="flex-1 pb-16">{children}</div>
        <BottomNav />
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width-icon": SIDEBAR_WIDTH_ICON } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        {children}
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
