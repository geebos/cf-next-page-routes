import * as React from "react";

import { cn } from "@/lib/utils";

export function Page({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page"
      className={cn("flex flex-1 flex-col bg-background pb-16 px-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
