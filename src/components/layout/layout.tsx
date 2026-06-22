import * as React from "react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar, Tabbar } from "./navigate";

// Collapsed sidebar shows icon stacked over smaller label, so it needs more
// width than shadcn's default 3rem (which only fits a square icon).
const SIDEBAR_WIDTH_ICON = "4.5rem";

export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <div className="flex-1 pb-16">{children}</div>
        <Tabbar />
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width-icon": SIDEBAR_WIDTH_ICON } as React.CSSProperties}
    >
      <Sidebar />
      <SidebarInset>
        {children}
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
