"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

type SelectOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type SelectBaseProps = {
  options: SelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  contentClassName?: string
  disabled?: boolean
  "aria-label"?: string
  "aria-invalid"?: boolean
}

type SelectSingleProps = SelectBaseProps & {
  multiple?: false
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type SelectMultipleProps = SelectBaseProps & {
  multiple: true
  clearButton?: boolean
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

type SelectProps = SelectSingleProps | SelectMultipleProps

function useControllableValue<T>({
  value,
  defaultValue,
  emptyValue,
  onValueChange,
}: {
  value: T | undefined
  defaultValue: T | undefined
  emptyValue: T
  onValueChange?: (value: T) => void
}) {
  const [internalValue, setInternalValue] = React.useState<T>(
    defaultValue ?? emptyValue
  )
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const setValue = React.useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setInternalValue(nextValue)
      }

      onValueChange?.(nextValue)
    },
    [isControlled, onValueChange]
  )

  return [currentValue, setValue] as const
}

function Select(props: SelectProps) {
  const {
    options,
    placeholder = "Select an option",
    emptyText = "No options found.",
    className,
    contentClassName,
    disabled,
    "aria-label": ariaLabel,
    "aria-invalid": ariaInvalid,
  } = props
  const values = React.useMemo(
    () => options.map((option) => option.value),
    [options]
  )
  const optionMap = React.useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options]
  )

  if (props.multiple) {
    return (
      <MultipleSelect
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        className={className}
        clearButton={props.clearButton}
        contentClassName={contentClassName}
        defaultValue={props.defaultValue}
        disabled={disabled}
        emptyText={emptyText}
        onValueChange={props.onValueChange}
        optionMap={optionMap}
        placeholder={placeholder}
        searchPlaceholder={props.searchPlaceholder}
        value={props.value}
        values={values}
      />
    )
  }

  return (
    <SingleSelect
      aria-invalid={ariaInvalid}
      aria-label={ariaLabel}
      className={className}
      contentClassName={contentClassName}
      defaultValue={props.defaultValue}
      disabled={disabled}
      emptyText={emptyText}
      onValueChange={props.onValueChange}
      optionMap={optionMap}
      placeholder={placeholder}
      value={props.value}
      values={values}
    />
  )
}

function SingleSelect({
  values,
  optionMap,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  emptyText,
  className,
  contentClassName,
  disabled,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: Omit<SelectSingleProps, "multiple" | "options"> & {
  values: string[]
  optionMap: Map<string, SelectOption>
  placeholder: string
  emptyText: string
}) {
  const [currentValue, setCurrentValue] = useControllableValue({
    value,
    defaultValue,
    emptyValue: "",
    onValueChange,
  })

  return (
    <Combobox
      items={values}
      value={currentValue}
      onValueChange={(nextValue) => setCurrentValue(String(nextValue ?? ""))}
      disabled={disabled}
      itemToStringLabel={(itemValue) =>
        optionMap.get(String(itemValue))?.label ?? String(itemValue)
      }
    >
      <ComboboxInput
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel ?? placeholder}
        className={cn("w-full", className)}
        disabled={disabled}
        placeholder={placeholder}
      />
      <SelectContent
        className={contentClassName}
        emptyText={emptyText}
        optionMap={optionMap}
      />
    </Combobox>
  )
}

function MultipleSelect({
  values,
  optionMap,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  searchPlaceholder = "Search options",
  emptyText,
  className,
  contentClassName,
  disabled,
  clearButton,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: Omit<SelectMultipleProps, "multiple" | "options"> & {
  values: string[]
  optionMap: Map<string, SelectOption>
  placeholder: string
  emptyText: string
}) {
  const anchorRef = useComboboxAnchor()
  const [currentValue, setCurrentValue] = useControllableValue({
    value,
    defaultValue,
    emptyValue: [],
    onValueChange,
  })

  return (
    <Combobox
      items={values}
      multiple
      value={currentValue}
      onValueChange={(nextValue) =>
        setCurrentValue(Array.isArray(nextValue) ? nextValue : [])
      }
      disabled={disabled}
    >
      <ComboboxChips
        ref={anchorRef}
        aria-invalid={ariaInvalid}
        className={cn("w-full", className)}
      >
        <ComboboxValue>
          {currentValue.map((item) => {
            const option = optionMap.get(item)

            return (
              <ComboboxChip key={item}>
                {option?.label ?? item}
              </ComboboxChip>
            )
          })}
        </ComboboxValue>
        <ComboboxChipsInput
          aria-label={ariaLabel ?? placeholder}
          disabled={disabled}
          placeholder={
            currentValue.length === 0 ? placeholder : searchPlaceholder
          }
        />
        {clearButton && currentValue.length > 0 && (
          <ComboboxClear aria-label="Clear selections" disabled={disabled} />
        )}
      </ComboboxChips>
      <SelectContent
        anchor={anchorRef}
        className={contentClassName}
        emptyText={emptyText}
        optionMap={optionMap}
      />
    </Combobox>
  )
}

function SelectContent({
  optionMap,
  emptyText,
  className,
  anchor,
}: {
  optionMap: Map<string, SelectOption>
  emptyText: string
  className?: string
  anchor?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <ComboboxContent anchor={anchor} className={className}>
      <ComboboxEmpty>{emptyText}</ComboboxEmpty>
      <ComboboxList>
        {(item: string) => {
          const option = optionMap.get(item)

          if (!option) {
            return null
          }

          return (
            <ComboboxItem
              key={option.value}
              disabled={option.disabled}
              value={option.value}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{option.label}</span>
                {option.description && (
                  <span className="truncate text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </span>
            </ComboboxItem>
          )
        }}
      </ComboboxList>
    </ComboboxContent>
  )
}

export { Select }
export type { SelectOption, SelectProps }