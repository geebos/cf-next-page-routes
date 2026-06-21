import { useState } from "react";
import { toast } from "sonner";
import {
  MailIcon,
  SearchIcon,
  PlusIcon,
  ChevronDownIcon,
  SettingsIcon,
  UserIcon,
  Trash2Icon,
  DownloadIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  BellIcon,
  InfoIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
  CopyIcon,
  StarIcon,
  FilterIcon,
  SaveIcon,
  RotateCcwIcon,
  MoreHorizontalIcon,
  CalendarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Select, type SelectOption } from "@/components/select";
import { cn } from "@/lib/utils";

const modelOptions: SelectOption[] = [
  {
    value: "iphone-17-pro",
    label: "iPhone 17 Pro",
    description: "Titanium flagship",
  },
  {
    value: "airpods-4",
    label: "AirPods 4",
    description: "Active noise cancellation",
  },
  {
    value: "watch-series-11",
    label: "Apple Watch Series 11",
    description: "Health & fitness",
  },
  {
    value: "vision-pro",
    label: "Apple Vision Pro",
    description: "Spatial computing",
    disabled: true,
  },
];

const toneOptions: SelectOption[] = [
  { value: "natural", label: "Natural Titanium" },
  { value: "blue", label: "Blue Titanium" },
  { value: "white", label: "White Titanium" },
  { value: "black", label: "Black Titanium" },
];

const pricingRows = [
  { model: "iPhone 17 Pro", context: "256GB", input: "$1,099", output: "—" },
  { model: "iPhone 17 Pro Max", context: "256GB", input: "$1,199", output: "—" },
  { model: "iPhone 17", context: "128GB", input: "$799", output: "—" },
  { model: "iPhone 17 Plus", context: "128GB", input: "$899", output: "—" },
];

function Section({
  id,
  title,
  description,
  tone = "light",
  children,
}: {
  id: string;
  title: string;
  description: string;
  tone?: "light" | "dark" | "parchment";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 px-6 py-16",
        tone === "light" && "bg-background text-foreground",
        tone === "dark" && "bg-[#272729] text-white",
        tone === "parchment" && "bg-[#f5f5f7] text-foreground",
      )}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="font-heading text-[34px] font-semibold leading-[1.47] tracking-[-0.374px]">
            {title}
          </h2>
          <p className="text-[17px] leading-[1.47] tracking-[-0.374px] text-muted-foreground">
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

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[14px] font-normal leading-[1.43] tracking-[-0.224px] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function Home() {
  const [sliderValue, setSliderValue] = useState<number[]>([40]);
  const [progress, setProgress] = useState(60);
  const [singleModel, setSingleModel] = useState("iphone-17-pro");
  const [multiTones, setMultiTones] = useState<string[]>(["warm", "bright"]);
  const [notifications, setNotifications] = useState(true);
  const [sliderInDialog, setSliderInDialog] = useState<number[]>([25]);

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
            Scroll for buttons, cards, forms, the Select component, and overlays.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">
              Browse components
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button variant="outline" size="lg">
              View design tokens
            </Button>
          </div>
        </section>

        {/* Buttons */}
        <Section
            id="buttons"
            title="Buttons"
            tone="light"
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

          {/* Badges */}
          <Section
            id="badges"
            title="Badges"
            tone="dark"
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

          {/* Cards */}
          <Section
            id="cards"
            title="Cards"
            tone="parchment"
            description="Alternating light and dark product tiles (edge-to-edge, no radius) plus a standard utility card at 18px radius."
          >
            <Row label="Product tiles">
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex h-56 flex-col justify-between rounded-none bg-background p-6 text-foreground">
                  <Badge className="w-fit bg-primary/10 text-primary">NEW</Badge>
                  <div>
                    <div className="font-heading text-[40px] font-semibold leading-[1.1]">iPhone 17 Pro</div>
                    <p className="mt-1 text-[14px] text-muted-foreground">Titanium flagship</p>
                  </div>
                </div>
                <div className="flex h-56 flex-col justify-between rounded-none bg-[#272729] p-6 text-white">
                  <Badge className="w-fit bg-white/10 text-white">AUDIO</Badge>
                  <div>
                    <div className="font-heading text-[32px] font-semibold leading-[1.1]">AirPods 4</div>
                    <p className="mt-1 text-[14px] text-white/80">Active noise cancellation</p>
                  </div>
                </div>
                <div className="flex h-56 flex-col justify-between rounded-none bg-[#f5f5f7] p-6 text-foreground">
                  <Badge className="w-fit bg-primary/10 text-primary">WATCH</Badge>
                  <div>
                    <div className="font-heading text-[32px] font-semibold leading-[1.1]">Apple Watch</div>
                    <p className="mt-1 text-[14px] text-muted-foreground">Health & fitness</p>
                  </div>
                </div>
                <div className="flex h-56 flex-col justify-between rounded-none bg-[#2a2a2c] p-6 text-white">
                  <Badge className="w-fit bg-white/10 text-white">SPATIAL</Badge>
                  <div>
                    <div className="font-heading text-[32px] font-semibold leading-[1.1]">Vision Pro</div>
                    <p className="mt-1 text-[14px] text-white/80">Spatial computing</p>
                  </div>
                </div>
              </div>
            </Row>

            <Row label="Standard card">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Token plan</CardTitle>
                  <CardDescription>
                    Pay-as-you-go pricing across every Apple product.
                  </CardDescription>
                  <CardAction>
                    <Badge className="bg-primary text-white">NEW</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-semibold">$0.70</span>
                    <span className="text-sm text-muted-foreground">/ 1M input tokens</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Includes 1M context window, JSON mode, and tool use.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Subscribe</Button>
                </CardFooter>
              </Card>
            </Row>
          </Section>

          {/* Forms */}
          <Section
            id="forms"
            title="Form controls"
            tone="light"
            description="Input, Textarea, Checkbox, Switch, RadioGroup, Slider, Progress — the building blocks for settings and onboarding flows."
          >
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@studio.com" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="search">
                  <SearchIcon className="size-4" data-icon="inline-start" />
                  Search models
                </Label>
                <Input id="search" placeholder="Try “reasoning” or “video”" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the shot: a lone astronaut walking across a salt flat at golden hour, wide lens, cinematic grade."
              />
            </div>

            <Separator />

            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Checkboxes
                </span>
                <div className="flex items-center gap-2">
                  <Checkbox id="terms" defaultChecked />
                  <Label htmlFor="terms">Accept terms of service</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="news" />
                  <Label htmlFor="news">Send me product updates</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="disabled" disabled />
                  <Label htmlFor="disabled" className="text-muted-foreground">
                    Disabled option
                  </Label>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Switches
                </span>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="notif">Push notifications</Label>
                  <Switch
                    id="notif"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="beta">Beta features</Label>
                  <Switch id="beta" defaultChecked />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="auto" className="text-muted-foreground">
                    Auto-save (disabled)
                  </Label>
                  <Switch id="auto" disabled />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Radio group
                </span>
                <RadioGroup defaultValue="pro">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free">Free — 10k tokens / month</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="pro" id="pro" />
                    <Label htmlFor="pro">Pro — 5M tokens / month</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="ent" id="ent" />
                    <Label htmlFor="ent">Enterprise — custom</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Slider &amp; progress
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label htmlFor="temp">Temperature</Label>
                    <span className="text-muted-foreground">{sliderValue[0] / 100}</span>
                  </div>
                  <Slider
                    id="temp"
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={5}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label htmlFor="prog">Storage used</Label>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress id="prog" value={progress} />
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setProgress((p) => Math.max(0, p - 10))}
                    >
                      <RotateCcwIcon data-icon="inline-start" />
                      Decrement
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setProgress((p) => Math.min(100, p + 10))}
                    >
                      <PlusIcon data-icon="inline-start" />
                      Increment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Select */}
          <Section
            id="select"
            title="Select"
            tone="dark"
            description="A custom Select built on Combobox. Supports single and multiple modes, search, descriptions, and disabled options."
          >
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="single-model">Single select</Label>
                <Select
                  options={modelOptions}
                  value={singleModel}
                  onValueChange={setSingleModel}
                  placeholder="Pick a model"
                  searchPlaceholder="Search models"
                  aria-label="Single select model"
                />
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{singleModel || "—"}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="multi-tone">Multi-select with chips</Label>
                <Select
                  multiple
                  clearButton
                  options={toneOptions}
                  value={multiTones}
                  onValueChange={setMultiTones}
                  placeholder="Pick tones"
                  searchPlaceholder="Search tones"
                  aria-label="Multi select tones"
                />
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">
                    {multiTones.length ? multiTones.join(", ") : "—"}
                  </span>
                </p>
              </div>
            </div>

            <Row label="States">
              <div className="flex w-full max-w-xs flex-col gap-2">
                <Label htmlFor="disabled-select">Disabled</Label>
                <Select
                  options={modelOptions}
                  disabled
                  placeholder="Cannot pick"
                  aria-label="Disabled select"
                />
              </div>
              <div className="flex w-full max-w-xs flex-col gap-2">
                <Label htmlFor="default-select">Uncontrolled (default)</Label>
                <Select
                  options={modelOptions}
                  defaultValue="hailuo"
                  placeholder="Pick a model"
                  aria-label="Uncontrolled select"
                />
              </div>
            </Row>
          </Section>

          {/* Feedback */}
          <Section
            id="feedback"
            title="Feedback"
            tone="parchment"
            description="Alerts for inline messaging, Skeleton for loading, and toast for transient confirmations."
          >
            <Row label="Alerts">
              <div className="flex w-full flex-col gap-3">
                <Alert>
                  <InfoIcon />
                  <AlertTitle>Heads up</AlertTitle>
                  <AlertDescription>
                    Your API key expires in 7 days. Rotate it from the settings page.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <TriangleAlertIcon />
                  <AlertTitle>Rate limit exceeded</AlertTitle>
                  <AlertDescription>
                    You’ve sent 1,200 requests in the last minute. Slow down or upgrade your plan.
                  </AlertDescription>
                  <AlertAction>
                    <Button size="sm" variant="outline">
                      Upgrade
                    </Button>
                  </AlertAction>
                </Alert>
                <Alert className="border-border bg-secondary text-foreground">
                  <CircleCheckIcon className="text-primary" />
                  <AlertTitle>Deployment live</AlertTitle>
                  <AlertDescription className="text-muted-foreground">
                    Your product is now serving traffic from 14 regions.
                  </AlertDescription>
                </Alert>
              </div>
            </Row>

            <Row label="Skeleton (loading)">
              <div className="flex w-full max-w-md flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full" />
              </div>
            </Row>

            <Row label="Toasts">
              <Button
                variant="outline"
                onClick={() => toast.success("Saved to your library.")}
              >
                <CheckIcon data-icon="inline-start" />
                Success toast
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.error("Couldn’t reach the inference endpoint.")
                }
              >
                <TriangleAlertIcon data-icon="inline-start" />
                Error toast
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast("iPhone 17 Pro is now available for pre-order.", {
                    description: "Read the release notes for what changed.",
                  })
                }
              >
                <BellIcon data-icon="inline-start" />
                Info toast
              </Button>
            </Row>
          </Section>

          {/* Overlays */}
          <Section
            id="overlays"
            title="Overlays"
            tone="light"
            description="Dialog for modal flows, DropdownMenu for action menus, Tooltip for inline hints."
          >
            <Row label="Dialog">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon data-icon="inline-start" />
                    New deployment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pre-order iPhone 17 Pro</DialogTitle>
                    <DialogDescription>
                      Pick a name and an initial temperature for your deployment.
                      You can change these later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="deploy-name">Deployment name</Label>
                      <Input id="deploy-name" defaultValue="prod-iphone-17-pro" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="deploy-temp">Temperature</Label>
                        <span className="text-xs text-muted-foreground">
                          {sliderInDialog[0] / 100}
                        </span>
                      </div>
                      <Slider
                        id="deploy-temp"
                        value={sliderInDialog}
                        onValueChange={setSliderInDialog}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={() => {
                        toast.success("Deployment queued.");
                      }}
                    >
                      Deploy
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Row>

            <Row label="Dropdown menu">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Actions
                    <ChevronDownIcon data-icon="inline-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Model</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <UserIcon /> Open profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CopyIcon /> Copy API key
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <DownloadIcon /> Export logs
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <Trash2Icon /> Delete deployment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <FilterIcon /> Filter rows
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <StarIcon /> Pin to top
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Row>

            <Row label="Tooltip">
              <TooltipProvider>
                <div className="flex items-center gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Info">
                        <InfoIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Token usage resets on the 1st of each month.
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Calendar">
                        <CalendarIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      View your billing cycle
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </Row>
          </Section>

          {/* Navigation + Data display */}
          <Section
            id="nav-data"
            title="Navigation & data display"
            tone="dark"
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
      </main>
    </div>
  );
}
