import { ListTodoIcon } from "lucide-react";

import { Page } from "@/components/layout/page";

export default function TodoPage() {
  return (
    <Page className="bg-secondary">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32 text-center">
        <ListTodoIcon className="size-10 text-muted-foreground/40" />
        <h1 className="font-heading text-[28px] font-semibold tracking-tight text-foreground">
          Todo
        </h1>
        <p className="text-[15px] text-muted-foreground">Coming soon.</p>
      </div>
    </Page>
  );
}
