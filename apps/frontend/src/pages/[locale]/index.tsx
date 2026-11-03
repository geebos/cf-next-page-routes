"use client";

import { useMemo, useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  DownloadIcon,
  ArrowRightIcon,
  SettingsIcon,
  SaveIcon,
  CheckIcon,
  SparklesIcon,
  InfoIcon,
  TriangleAlertIcon,
  CircleCheckIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  CopyIcon,
  Trash2Icon,
  MoreHorizontalIcon,
  FilterIcon,
  StarIcon,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
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
import { Select, type SelectOption } from "@/components/ui/select";
import { Section, Row } from "@/components/pages/index/section";
import { Page } from "@/components/layout/page";
import { Seo } from "@/components/i18n/Seo";
import { getLocaleStaticPaths, makeStaticProps } from "@/lib/i18n-static";

type FormValues = {
  email: string;
  prompt: string;
  terms: boolean;
  plan: "free" | "pro" | "ent";
  finishes: string[];
  temperature: number;
  notifications: boolean;
};

function makeFormSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("demo:forms.error.email")),
    prompt: z
      .string()
      .min(20, t("demo:forms.error.promptMin"))
      .max(200, t("demo:forms.error.promptMax")),
    terms: z
      .boolean()
      .refine((v) => v === true, t("demo:forms.error.terms")),
    plan: z.enum(["free", "pro", "ent"], {
      error: t("demo:forms.error.plan"),
    }),
    finishes: z.array(z.string()).min(1, t("demo:forms.error.finishes")),
    temperature: z.number().min(0).max(100),
    notifications: z.boolean(),
  });
}

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

export default function Home() {
  const { t } = useTranslation(["common", "demo"]);
  const [singleModel, setSingleModel] = useState<string | null>("iphone-17-pro");
  const [multiTones, setMultiTones] = useState<string[]>(["blue", "white"]);
  const [sliderInDialog, setSliderInDialog] = useState<number[]>([25]);

  const formSchema = useMemo(() => makeFormSchema(t), [t]);

  const modelOptions: SelectOption[] = useMemo(
    () => [
      {
        value: "iphone-17-pro",
        label: "iPhone 17 Pro",
        description: t("demo:select.desc.iphone17Pro"),
      },
      {
        value: "airpods-4",
        label: "AirPods 4",
        description: t("demo:select.desc.airpods4"),
      },
      {
        value: "watch-series-11",
        label: "Apple Watch Series 11",
        description: t("demo:select.desc.appleWatch"),
      },
      {
        value: "vision-pro",
        label: "Apple Vision Pro",
        description: t("demo:select.desc.visionPro"),
        disabled: true,
      },
    ],
    [t],
  );

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      email: "",
      prompt: "",
      terms: false,
      plan: "pro",
      finishes: ["blue"],
      temperature: 40,
      notifications: true,
    },
  });

  function onSubmit(data: FormValues) {
    toast.success(t("demo:forms.toast.submitted"), {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-muted p-4 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Page className="bg-secondary">
      <Seo
        title={t("demo:metaTitle")}
        description={t("demo:metaDescription")}
        path="/"
      />
      <Section
        title={t("demo:buttons.title")}
        description={t("demo:buttons.description")}
      >
        <Row label={t("demo:buttons.row.variants")}>
          <Button>{t("demo:buttons.variant.primary")}</Button>
          <Button variant="secondary">{t("demo:buttons.variant.secondary")}</Button>
          <Button variant="outline">{t("demo:buttons.variant.outline")}</Button>
          <Button variant="ghost">{t("demo:buttons.variant.ghost")}</Button>
          <Button variant="destructive">{t("demo:buttons.variant.destructive")}</Button>
          <Button variant="link">{t("demo:buttons.variant.link")}</Button>
        </Row>

        <Row label={t("demo:buttons.row.sizes")}>
          <Button size="xs">{t("demo:buttons.size.extraSmall")}</Button>
          <Button size="sm">{t("demo:buttons.size.small")}</Button>
          <Button size="default">{t("demo:buttons.size.default")}</Button>
          <Button size="lg">{t("demo:buttons.size.large")}</Button>
        </Row>

        <Row label={t("demo:buttons.row.withIcons")}>
          <Button>
            <PlusIcon data-icon="inline-start" />
            {t("demo:buttons.label.newProject")}
          </Button>
          <Button variant="outline">
            <DownloadIcon data-icon="inline-start" />
            {t("demo:buttons.label.export")}
          </Button>
          <Button variant="secondary">
            {t("demo:buttons.label.continue")}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button size="icon" variant="outline" aria-label={t("demo:buttons.aria.settings")}>
            <SettingsIcon />
          </Button>
          <Button size="icon" aria-label={t("demo:buttons.aria.add")}>
            <PlusIcon />
          </Button>
        </Row>

        <Row label={t("demo:buttons.row.states")}>
          <Button>{t("demo:buttons.size.default")}</Button>
          <Button disabled>{t("demo:buttons.label.disabled")}</Button>
          <Button variant="outline" disabled>
            {t("demo:buttons.label.disabledOutline")}
          </Button>
          <Button
            onClick={() => toast.success(t("demo:buttons.toast.saved"))}
          >
            <SaveIcon data-icon="inline-start" />
            {t("demo:buttons.label.triggerToast")}
          </Button>
        </Row>
      </Section>
      <Section
        title={t("demo:badges.title")}
        description={t("demo:badges.description")}
      >
        <Row label={t("demo:badges.row.variants")}>
          <Badge>{t("demo:badges.label.default")}</Badge>
          <Badge variant="secondary">{t("demo:badges.label.secondary")}</Badge>
          <Badge variant="outline">{t("demo:badges.label.outline")}</Badge>
          <Badge variant="destructive">{t("demo:badges.label.destructive")}</Badge>
        </Row>

        <Row label={t("demo:badges.row.productIdentity")}>
          <Badge className="bg-primary text-white">{t("demo:badges.label.new")}</Badge>
          <Badge className="bg-secondary text-foreground">{t("demo:badges.label.beta")}</Badge>
          <Badge className="bg-secondary text-foreground">{t("demo:badges.label.available")}</Badge>
          <Badge className="bg-foreground text-background">{t("demo:badges.label.live")}</Badge>
          <Badge className="bg-secondary text-foreground rounded-sm">{t("demo:badges.label.code")}</Badge>
        </Row>

        <Row label={t("demo:badges.row.withIcons")}>
          <Badge variant="secondary">
            <CheckIcon /> {t("demo:badges.label.verified")}
          </Badge>
          <Badge className="bg-primary text-white">
            <SparklesIcon /> {t("demo:badges.label.featured")}
          </Badge>
        </Row>
      </Section>
      <Section
        title={t("demo:cards.title")}
        description={t("demo:cards.description")}
      >
        <Row label={t("demo:cards.row.productTiles")}>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex h-56 flex-col justify-between rounded-none bg-background p-6 text-foreground">
              <Badge className="w-fit bg-primary/10 text-primary">{t("demo:badges.label.new")}</Badge>
              <div>
                <div className="font-heading text-[40px] font-semibold leading-[1.1]">iPhone 17 Pro</div>
                <p className="mt-1 text-[14px] text-muted-foreground">{t("demo:cards.desc.iphone17Pro")}</p>
              </div>
            </div>
            <div className="flex h-56 flex-col justify-between rounded-none bg-[#272729] p-6 text-white">
              <Badge className="w-fit bg-white/10 text-white">{t("demo:badges.label.audio")}</Badge>
              <div>
                <div className="font-heading text-[32px] font-semibold leading-[1.1]">AirPods 4</div>
                <p className="mt-1 text-[14px] text-white/80">{t("demo:cards.desc.airpods4")}</p>
              </div>
            </div>
            <div className="flex h-56 flex-col justify-between rounded-none bg-secondary p-6 text-foreground">
              <Badge className="w-fit bg-primary/10 text-primary">{t("demo:badges.label.watch")}</Badge>
              <div>
                <div className="font-heading text-[32px] font-semibold leading-[1.1]">Apple Watch</div>
                <p className="mt-1 text-[14px] text-muted-foreground">{t("demo:cards.desc.appleWatch")}</p>
              </div>
            </div>
            <div className="flex h-56 flex-col justify-between rounded-none bg-[#2a2a2c] p-6 text-white">
              <Badge className="w-fit bg-white/10 text-white">{t("demo:badges.label.spatial")}</Badge>
              <div>
                <div className="font-heading text-[32px] font-semibold leading-[1.1]">Vision Pro</div>
                <p className="mt-1 text-[14px] text-white/80">{t("demo:cards.desc.visionPro")}</p>
              </div>
            </div>
          </div>
        </Row>

        <Row label={t("demo:cards.row.standardCard")}>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t("demo:cards.tokenPlan.title")}</CardTitle>
              <CardDescription>
                {t("demo:cards.tokenPlan.description")}
              </CardDescription>
              <CardAction>
                <Badge className="bg-primary text-white">{t("demo:badges.label.new")}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-3xl font-semibold">$0.70</span>
                <span className="text-sm text-muted-foreground">{t("demo:cards.tokenPlan.unit")}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("demo:cards.tokenPlan.detail")}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">{t("demo:cards.button.subscribe")}</Button>
            </CardFooter>
          </Card>
        </Row>
      </Section>
      <Section
        title={t("demo:forms.title")}
        description={t("demo:forms.description")}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("demo:forms.label.email")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("demo:forms.placeholder.email")}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="prompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("demo:forms.label.prompt")}</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("demo:forms.placeholder.prompt")}
                  />
                  <FieldDescription>
                    {t("demo:forms.promptChars", { count: field.value.length })}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="terms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldLabel htmlFor={field.name}>
                    {t("demo:forms.label.terms")}
                  </FieldLabel>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="plan"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("demo:forms.label.plan")}</FieldLabel>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="free" id="plan-free" />
                      <FieldLabel htmlFor="plan-free">
                        {t("demo:forms.plan.free")}
                      </FieldLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="pro" id="plan-pro" />
                      <FieldLabel htmlFor="plan-pro">
                        {t("demo:forms.plan.pro")}
                      </FieldLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="ent" id="plan-ent" />
                      <FieldLabel htmlFor="plan-ent">
                        {t("demo:forms.plan.ent")}
                      </FieldLabel>
                    </div>
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="temperature"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>{t("demo:forms.label.temperature")}</FieldLabel>
                    <span className="text-sm text-muted-foreground">
                      {field.value / 100}
                    </span>
                  </div>
                  <Slider
                    id={field.name}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                    max={100}
                    step={5}
                  />
                </Field>
              )}
            />

            <Controller
              name="finishes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("demo:forms.label.finishes")}</FieldLabel>
                  <Select
                    {...field}
                    multiple
                    id={field.name}
                    options={toneOptions}
                    showClear
                    aria-invalid={fieldState.invalid}
                    aria-label={t("demo:forms.label.finishes")}
                    placeholder={t("demo:forms.finishes.placeholder")}
                    emptyText={t("demo:forms.finishes.emptyText")}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="notifications"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldLabel htmlFor={field.name}>
                    {t("demo:forms.label.notifications")}
                  </FieldLabel>
                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                {t("demo:forms.button.reset")}
              </Button>
              <Button type="submit">{t("demo:forms.button.submit")}</Button>
            </div>
          </FieldGroup>
        </form>
      </Section>
      <Section
        title={t("demo:select.title")}
        description={t("demo:select.description")}
      >
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="single-model">{t("demo:select.label.single")}</Label>
            <Select
              options={modelOptions}
              value={singleModel}
              onChange={setSingleModel}
              placeholder={t("demo:select.placeholder.pickModel")}
              emptyText={t("demo:select.emptyText.noModels")}
              aria-label={t("demo:select.aria.single")}
            />
            <p className="text-xs text-muted-foreground">
              {t("demo:select.selected")} <span className="font-medium text-foreground">{singleModel || "—"}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="multi-tone">{t("demo:select.label.multi")}</Label>
            <Select
              multiple
              options={toneOptions}
              value={multiTones}
              onChange={setMultiTones}
              placeholder={t("demo:select.placeholder.addTones")}
              emptyText={t("demo:select.emptyText.noTones")}
              aria-label={t("demo:select.aria.multi")}
            />
            <p className="text-xs text-muted-foreground">
              {t("demo:select.selected")} <span className="font-medium text-foreground">
                {multiTones.length ? multiTones.join(", ") : "—"}
              </span>
            </p>
          </div>
        </div>

        <Row label={t("demo:select.title")}>
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Label htmlFor="clearable-select">{t("demo:select.label.clearable")}</Label>
            <Select
              options={modelOptions}
              showClear
              placeholder={t("demo:select.placeholder.pickModel")}
              aria-label={t("demo:select.aria.clearable")}
            />
          </div>
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Label htmlFor="disabled-select">{t("demo:select.label.disabled")}</Label>
            <Select
              options={modelOptions}
              disabled
              placeholder={t("demo:select.disabledPlaceholder")}
              aria-label={t("demo:select.aria.disabled")}
            />
          </div>
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Label htmlFor="auto-highlight-select">{t("demo:select.label.autoHighlight")}</Label>
            <Select
              options={modelOptions}
              autoHighlight
              placeholder={t("demo:select.placeholder.pickModel")}
              aria-label={t("demo:select.aria.autoHighlight")}
            />
          </div>
        </Row>
      </Section>
      <Section
        title={t("demo:feedback.title")}
        description={t("demo:feedback.description")}
      >
        <Row label={t("demo:feedback.row.alerts")}>
          <div className="flex w-full flex-col gap-3">
            <Alert>
              <InfoIcon />
              <AlertTitle>{t("demo:feedback.alert.headsUp.title")}</AlertTitle>
              <AlertDescription>
                {t("demo:feedback.alert.headsUp.description")}
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>{t("demo:feedback.alert.rateLimit.title")}</AlertTitle>
              <AlertDescription>
                {t("demo:feedback.alert.rateLimit.description")}
              </AlertDescription>
              <AlertAction>
                <Button size="sm" variant="outline">
                  {t("demo:feedback.button.upgrade")}
                </Button>
              </AlertAction>
            </Alert>
            <Alert className="border-border bg-secondary text-foreground">
              <CircleCheckIcon className="text-primary" />
              <AlertTitle>{t("demo:feedback.alert.deploymentLive.title")}</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                {t("demo:feedback.alert.deploymentLive.description")}
              </AlertDescription>
            </Alert>
          </div>
        </Row>

        <Row label={t("demo:feedback.row.skeleton")}>
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

        <Row label={t("demo:feedback.row.toasts")}>
          <Button
            variant="outline"
            onClick={() => toast.success(t("demo:feedback.toast.success.message"))}
          >
            <CheckIcon data-icon="inline-start" />
            {t("demo:feedback.toast.success.label")}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error(t("demo:feedback.toast.error.message"))
            }
          >
            <TriangleAlertIcon data-icon="inline-start" />
            {t("demo:feedback.toast.error.label")}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast(t("demo:feedback.toast.info.message"), {
                description: t("demo:feedback.toast.info.description"),
              })
            }
          >
            <BellIcon data-icon="inline-start" />
            {t("demo:feedback.toast.info.label")}
          </Button>
        </Row>
      </Section>
      <Section
        title={t("demo:overlays.title")}
        description={t("demo:overlays.description")}
      >
        <Row label={t("demo:overlays.row.dialog")}>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon data-icon="inline-start" />
                {t("demo:overlays.dialog.trigger")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("demo:overlays.dialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("demo:overlays.dialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="deploy-name">{t("demo:overlays.dialog.label.deployName")}</Label>
                  <Input id="deploy-name" defaultValue="prod-iphone-17-pro" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="deploy-temp">{t("demo:overlays.dialog.label.temperature")}</Label>
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
                  <Button variant="outline">{t("demo:overlays.dialog.button.cancel")}</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    toast.success(t("demo:overlays.dialog.toast.queued"));
                  }}
                >
                  {t("demo:overlays.dialog.button.deploy")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>

        <Row label={t("demo:overlays.row.dropdownMenu")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {t("demo:overlays.dropdown.trigger")}
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>{t("demo:overlays.dropdown.label")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserIcon /> {t("demo:overlays.dropdown.item.openProfile")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyIcon /> {t("demo:overlays.dropdown.item.copyApiKey")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DownloadIcon /> {t("demo:overlays.dropdown.item.exportLogs")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2Icon /> {t("demo:overlays.dropdown.item.deleteDeployment")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("demo:overlays.aria.more")}>
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <FilterIcon /> {t("demo:overlays.dropdown.item.filterRows")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <StarIcon /> {t("demo:overlays.dropdown.item.pinToTop")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Row>

        <Row label={t("demo:overlays.row.tooltip")}>
          <TooltipProvider>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" aria-label={t("demo:overlays.tooltip.aria.info")}>
                    <InfoIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("demo:overlays.tooltip.content.tokenUsage")}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" aria-label={t("demo:overlays.tooltip.aria.calendar")}>
                    <CalendarIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("demo:overlays.tooltip.content.billingCycle")}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </Row>
      </Section>
      <Section
        title={t("demo:navData.title")}
        description={t("demo:navData.description")}
      >
        <Row label={t("demo:navData.row.tabs")}>
          <Tabs defaultValue="bench" className="w-full">
            <TabsList>
              <TabsTrigger value="bench">{t("demo:navData.tab.benchmark")}</TabsTrigger>
              <TabsTrigger value="self">{t("demo:navData.tab.selfEvaluation")}</TabsTrigger>
              <TabsTrigger value="agents">{t("demo:navData.tab.multiAgent")}</TabsTrigger>
            </TabsList>
            <TabsContent value="bench" className="mt-4 text-sm text-muted-foreground">
              {t("demo:navData.tabContent.benchmark")}
            </TabsContent>
            <TabsContent value="self" className="mt-4 text-sm text-muted-foreground">
              {t("demo:navData.tabContent.selfEvaluation")}
            </TabsContent>
            <TabsContent value="agents" className="mt-4 text-sm text-muted-foreground">
              {t("demo:navData.tabContent.multiAgent")}
            </TabsContent>
          </Tabs>
        </Row>

        <Row label={t("demo:navData.row.accordion")}>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>{t("demo:navData.accordion.q1.title")}</AccordionTrigger>
              <AccordionContent>
                {t("demo:navData.accordion.q1.content")}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>{t("demo:navData.accordion.q2.title")}</AccordionTrigger>
              <AccordionContent>
                {t("demo:navData.accordion.q2.content")}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>{t("demo:navData.accordion.q3.title")}</AccordionTrigger>
              <AccordionContent>
                {t("demo:navData.accordion.q3.content")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Row>

        <Row label={t("demo:navData.row.avatars")}>
          <div className="flex items-center gap-6">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=12" alt={t("demo:navData.alt.user")} />
              <AvatarFallback>MM</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>MX</AvatarFallback>
            </Avatar>
            <AvatarGroup>
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/64?img=5" alt={t("demo:navData.alt.user")} />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/64?img=8" alt={t("demo:navData.alt.user")} />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/64?img=15" alt={t("demo:navData.alt.user")} />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+5</AvatarGroupCount>
            </AvatarGroup>
          </div>
        </Row>

        <Row label={t("demo:navData.row.table")}>
          <div className="overflow-hidden rounded-sm border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="pl-4">{t("demo:navData.table.model")}</TableHead>
                  <TableHead>{t("demo:navData.table.context")}</TableHead>
                  <TableHead>{t("demo:navData.table.input")}</TableHead>
                  <TableHead className="pr-4">{t("demo:navData.table.output")}</TableHead>
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
    </Page>
  );
}

export const getStaticPaths = getLocaleStaticPaths;
export const getStaticProps = makeStaticProps(["common", "demo"]);
