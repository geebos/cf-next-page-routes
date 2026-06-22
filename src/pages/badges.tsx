import {
  CheckIcon,
  SparklesIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Section, Row } from "@/components/showcase/section";

export default function BadgesPage() {
  return (
    <Section
      title="Badges"
      description="A single-accent system: Action Blue for NEW and emphasis, neutral surfaces for status and labels."
    >
      <Row label="Variants">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </Row>

      <Row label="Product identity">
        <Badge className="bg-primary text-white">NEW</Badge>
        <Badge className="bg-secondary text-foreground">BETA</Badge>
        <Badge className="bg-secondary text-foreground">Available</Badge>
        <Badge className="bg-foreground text-background">Live</Badge>
        <Badge className="bg-secondary text-foreground rounded-sm">CODE</Badge>
      </Row>

      <Row label="With icons">
        <Badge variant="secondary">
          <CheckIcon /> Verified
        </Badge>
        <Badge className="bg-primary text-white">
          <SparklesIcon /> Featured
        </Badge>
      </Row>
    </Section>
  );
}
