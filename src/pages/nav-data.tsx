import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Section, Row } from "@/components/showcase/section";

const pricingRows = [
  { model: "iPhone 17 Pro", context: "256GB", input: "$1,099", output: "—" },
  { model: "iPhone 17 Pro Max", context: "256GB", input: "$1,199", output: "—" },
  { model: "iPhone 17", context: "128GB", input: "$799", output: "—" },
  { model: "iPhone 17 Plus", context: "128GB", input: "$899", output: "—" },
];

export default function NavDataPage() {
  return (
    <Section
      title="Navigation & data display"
      description="Tabs, Accordion, Avatar, and Table for dense information surfaces like docs and pricing pages."
    >
      <Row label="Tabs">
        <Tabs defaultValue="bench" className="w-full">
          <TabsList>
            <TabsTrigger value="bench">Benchmark</TabsTrigger>
            <TabsTrigger value="self">Self-evaluation</TabsTrigger>
            <TabsTrigger value="agents">Multi-agent</TabsTrigger>
          </TabsList>
          <TabsContent value="bench" className="mt-4 text-sm text-muted-foreground">
            iPhone 17 Pro scores 3,546 on Geekbench 6 single-core, leading mobile silicon.
          </TabsContent>
          <TabsContent value="self" className="mt-4 text-sm text-muted-foreground">
            Self-evaluated against 12 reasoning categories with calibrated confidence.
          </TabsContent>
          <TabsContent value="agents" className="mt-4 text-sm text-muted-foreground">
            Orchestrates tool calls across 5 parallel agents without dropping state.
          </TabsContent>
        </Tabs>
      </Row>

      <Row label="Accordion">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger>How is pricing calculated?</AccordionTrigger>
            <AccordionContent>
              Tokens are metered per 1M input and 1M output separately. Cached
              input tokens are billed at a 90% discount.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>Which regions are supported?</AccordionTrigger>
            <AccordionContent>
              Inference runs in 14 regions across North America, Europe, and Asia.
              Routing is automatic and latency-aware.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>Can I fine-tune a model?</AccordionTrigger>
            <AccordionContent>
              Yes — engraving is available on iPhone 17 Pro and AirPods 4. Add your
              text at checkout and we handle the rest.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Row>

      <Row label="Avatars">
        <div className="flex items-center gap-6">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/64?img=12" alt="User" />
            <AvatarFallback>MM</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>MX</AvatarFallback>
          </Avatar>
          <AvatarGroup>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=5" alt="User" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=8" alt="User" />
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=15" alt="User" />
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+5</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </Row>

      <Row label="Table">
        <div className="overflow-hidden rounded-sm border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="pl-4">Model</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Input / 1M</TableHead>
                <TableHead className="pr-4">Output / 1M</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingRows.map((row) => (
                <TableRow key={row.model}>
                  <TableCell className="pl-4 font-medium">{row.model}</TableCell>
                  <TableCell className="text-muted-foreground">{row.context}</TableCell>
                  <TableCell>{row.input}</TableCell>
                  <TableCell className="pr-4">{row.output}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Row>
    </Section>
  );
}
