"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Section } from "@/components/showcase/section";

const formSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  prompt: z
    .string()
    .min(20, "Prompt must be at least 20 characters.")
    .max(200, "Prompt must be at most 200 characters."),
  terms: z
    .boolean()
    .refine((v) => v === true, "You must accept the terms of service."),
  plan: z.enum(["free", "pro", "ent"], {
    error: "Select a plan.",
  }),
  temperature: z.number().min(0).max(100),
  notifications: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormsPage() {
  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      email: "",
      prompt: "",
      terms: false,
      plan: "pro",
      temperature: 40,
      notifications: true,
    },
  });

  function onSubmit(data: FormValues) {
    toast.success("Form submitted", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-muted p-4 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Section
      title="Form controls"
      description="A react-hook-form form with zod validation — input, textarea, checkbox, switch, radio group, and slider bound via Controller."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="you@studio.com"
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
                <FieldLabel htmlFor={field.name}>Prompt</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Describe the shot: a lone astronaut walking across a salt flat at golden hour, wide lens, cinematic grade."
                />
                <FieldDescription>
                  {field.value.length}/200 characters
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
                  Accept terms of service
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
                <FieldLabel>Plan</FieldLabel>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="free" id="plan-free" />
                    <FieldLabel htmlFor="plan-free">
                      Free — 10k tokens / month
                    </FieldLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="pro" id="plan-pro" />
                    <FieldLabel htmlFor="plan-pro">
                      Pro — 5M tokens / month
                    </FieldLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="ent" id="plan-ent" />
                    <FieldLabel htmlFor="plan-ent">
                      Enterprise — custom
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
                  <FieldLabel htmlFor={field.name}>Temperature</FieldLabel>
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
            name="notifications"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldLabel htmlFor={field.name}>
                  Push notifications
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
              Reset
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </FieldGroup>
      </form>
    </Section>
  );
}
