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
import { PlusIcon } from "lucide-react"

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
  filter?: boolean
  creatable?: boolean
  createLabel?: (query: string) => string
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
    filter = false,
    creatable = false,
    createLabel = (query: string) => `Add "${query}"`,
    "aria-label": ariaLabel,
    "aria-invalid": ariaInvalid,
  } = props
  const [inputValue, setInputValue] = React.useState("")
  const trimmedQuery = inputValue.trim()
  const optionValues = React.useMemo(
    () => options.map((option) => option.value),
    [options]
  )
  const optionMap = React.useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options]
  )
  const selectedValues = React.useMemo(
    () =>
      props.multiple
        ? new Set(props.value ?? props.defaultValue ?? [])
        : new Set([props.value ?? props.defaultValue ?? ""]),
    [props.defaultValue, props.multiple, props.value]
  )
  const canCreate =
    creatable &&
    trimmedQuery.length > 0 &&
    !optionMap.has(trimmedQuery) &&
    !selectedValues.has(trimmedQuery)
  const values = React.useMemo(
    () => (canCreate ? [...optionValues, trimmedQuery] : optionValues),
    [canCreate, optionValues, trimmedQuery]
  )
  const shouldFilter = filter || creatable

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
        filter={shouldFilter}
        createLabel={createLabel}
        createValue={canCreate ? trimmedQuery : undefined}
        onInputValueChange={setInputValue}
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
      filter={shouldFilter}
      createLabel={createLabel}
      createValue={canCreate ? trimmedQuery : undefined}
      onInputValueChange={setInputValue}
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
  filter,
  createLabel,
  createValue,
  onInputValueChange,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: Omit<SelectSingleProps, "multiple" | "options"> & {
  values: string[]
  optionMap: Map<string, SelectOption>
  placeholder: string
  emptyText: string
  createValue?: string
  onInputValueChange: (value: string) => void
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
      onInputValueChange={onInputValueChange}
      autoComplete={filter ? "list" : "none"}
      disabled={disabled}
      filter={filter ? undefined : null}
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
        readOnly={!filter}
      />
      <SelectContent
        className={contentClassName}
        createLabel={createLabel}
        createValue={createValue}
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
  filter,
  createLabel,
  createValue,
  onInputValueChange,
  clearButton,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: Omit<SelectMultipleProps, "multiple" | "options"> & {
  values: string[]
  optionMap: Map<string, SelectOption>
  placeholder: string
  emptyText: string
  createValue?: string
  onInputValueChange: (value: string) => void
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
      onInputValueChange={onInputValueChange}
      autoComplete={filter ? "list" : "none"}
      disabled={disabled}
      filter={filter ? undefined : null}
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
          readOnly={!filter}
        />
        {clearButton && currentValue.length > 0 && (
          <ComboboxClear aria-label="Clear selections" disabled={disabled} />
        )}
      </ComboboxChips>
      <SelectContent
        anchor={anchorRef}
        className={contentClassName}
        createLabel={createLabel}
        createValue={createValue}
        emptyText={emptyText}
        optionMap={optionMap}
      />
    </Combobox>
  )
}

function SelectContent({
  optionMap,
  createLabel,
  createValue,
  emptyText,
  className,
  anchor,
}: {
  optionMap: Map<string, SelectOption>
  createLabel?: (query: string) => string
  createValue?: string
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
            if (item === createValue) {
              return (
                <ComboboxItem key={item} value={item}>
                  <PlusIcon className="text-muted-foreground" />
                  <span className="flex flex-1 shrink-0 whitespace-nowrap">
                    {createLabel?.(item) ?? item}
                  </span>
                </ComboboxItem>
              )
            }

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
