import * as React from "react";
import {
  Card,
} from "@/components/ui/card";

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="scroll-mt-24 bg-secondary py-(--section-space) text-foreground"
    >
      <div className="page-container">
        <div className="mb-8 flex flex-col gap-3">
          <h2 className="font-heading text-[36px] font-bold leading-[1.18] tracking-[-0.03em] md:text-[40px]">
            {title}
          </h2>
          <p className="max-w-[65ch] text-base leading-[1.85] text-muted-foreground md:text-lg md:leading-[1.78]">
            {description}
          </p>
        </div>
        <Card className="p-6">
          <div className="flex flex-col gap-8">{children}</div>
        </Card>
      </div>
    </section>
  );
}

export function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold leading-[1.45] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
