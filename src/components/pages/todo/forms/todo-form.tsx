"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";

import {
  createTodoSchema,
  updateTodoSchema,
  localStartOfTodayMs,
  localStartOfTodayDate,
  formatDueDateMs,
  msToPickerDate,
  pickerDateToMs,
  type CreateTodoInput,
  type UpdateTodoInput,
  type Priority,
  type Todo,
} from "@/shared/schemas";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { Select } from "@/components/ui/select";

type FormValues = {
  task: string;
  priority: Priority;
  dueDate: number;
};

const PRIORITY_VALUES = ["low", "medium", "high"] as const;

// Browser-only: block local-past days (shared create schema is midnight + loose only).
const clientCreateTodoSchema = createTodoSchema.refine(
  (data) => data.dueDate >= localStartOfTodayMs(),
  { message: "不能选过去日期", path: ["dueDate"] },
);

function Form<T extends Partial<FormValues>>({
  edit,
  defaultValues,
  onSubmit,
  onCancel,
}: {
  edit: boolean;
  defaultValues: FormValues;
  onSubmit: (input: T) => Promise<void>;
  onCancel?: () => void;
}) {
  const { t } = useTranslation(["common", "todo"]);
  const [submitting, setSubmitting] = useState(false);
  const resolver = zodResolver(edit ? updateTodoSchema : clientCreateTodoSchema);

  const priorityOptions = useMemo(
    () =>
      PRIORITY_VALUES.map((value) => ({
        value,
        label: t(`todo:priority.${value}`),
      })),
    [t],
  );

  const form = useForm<FormValues>({
    resolver: resolver as never,
    defaultValues,
  });

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await onSubmit(values as T);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col gap-4">
      <Controller
        name="task"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{t("todo:task.label")}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder={t("todo:task.placeholder")}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="priority"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{t("todo:priority.label")}</FieldLabel>
            <Select
              {...field}
              options={priorityOptions}
              aria-label={t("todo:priority.label")}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="dueDate"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{t("todo:dueDate.label")}</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                  aria-invalid={fieldState.invalid}
                >
                  <CalendarIcon className="size-4 opacity-50" />
                  {field.value ? formatDueDateMs(field.value) : t("todo:dueDate.placeholder")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? msToPickerDate(field.value) : undefined}
                  onSelect={(d) => {
                    if (!d) return;
                    field.onChange(pickerDateToMs(d));
                  }}
                  disabled={{ before: localStartOfTodayDate() }}
                />
              </PopoverContent>
            </Popover>
            {!edit && (
              <FieldDescription>{t("todo:dueDate.description")}</FieldDescription>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end gap-2">
        {edit && onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            {t("todo:button.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting && <Spinner className="size-4" />}
          {edit ? t("todo:button.save") : t("todo:button.submit")}
        </Button>
      </div>
    </form>
  );
}

export function CreateTodoForm({
  onSubmit,
}: {
  onSubmit: (input: CreateTodoInput) => Promise<void>;
}) {
  return (
    <Form<CreateTodoInput>
      edit={false}
      defaultValues={{ task: "", priority: "medium", dueDate: localStartOfTodayMs() }}
      onSubmit={onSubmit}
    />
  );
}

export function UpdateTodoForm({
  todo,
  onSubmit,
  onCancel,
}: {
  todo: Todo;
  onSubmit: (input: UpdateTodoInput) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <Form<UpdateTodoInput>
      edit={true}
      defaultValues={{ task: todo.task, priority: todo.priority, dueDate: todo.dueDate }}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
