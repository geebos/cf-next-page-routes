import {
  PlusIcon,
  DownloadIcon,
  ArrowRightIcon,
  SettingsIcon,
  SaveIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Section, Row } from "@/components/showcase/section";

export default function ButtonsPage() {
  return (
    <Section
      title="Buttons"
      description="Pill-shaped (`rounded-full`) primary CTA in Action Blue, plus secondary outline-pill and ghost variants."
    >
      <Row label="Variants">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </Row>

      <Row label="Sizes">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </Row>

      <Row label="With icons">
        <Button>
          <PlusIcon data-icon="inline-start" />
          New project
        </Button>
        <Button variant="outline">
          <DownloadIcon data-icon="inline-start" />
          Export
        </Button>
        <Button variant="secondary">
          Continue
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="icon" variant="outline" aria-label="Settings">
          <SettingsIcon />
        </Button>
        <Button size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </Row>

      <Row label="States">
        <Button>Default</Button>
        <Button disabled>Disabled</Button>
        <Button variant="outline" disabled>
          Disabled outline
        </Button>
        <Button
          onClick={() => toast.success("Saved to your library.")}
        >
          <SaveIcon data-icon="inline-start" />
          Trigger toast
        </Button>
      </Row>
    </Section>
  );
}
