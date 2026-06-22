import Link from "next/link";
import {
  SparklesIcon,
  ArrowRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-svh">
      <main>
        {/* Hero */}
        <section className="mx-auto mb-20 flex max-w-5xl flex-col items-start gap-6 px-6 pt-20">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
            <SparklesIcon /> Components showcase
          </Badge>
          <h1 className="font-heading text-[56px] font-semibold leading-[1.07] tracking-[-0.28px] text-foreground">
            shadcn/ui, styled in
            <br />
            the Apple language.
          </h1>
          <p className="max-w-2xl text-[17px] leading-[1.47] tracking-[-0.374px] text-muted-foreground">
            Every component on this page is the stock shadcn/ui source — restyled with
            Action Blue, SF Pro typography, and pill-button signature.
            Browse buttons, cards, forms, the Select component, and overlays.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/buttons/">
                Browse components
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              View design tokens
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
