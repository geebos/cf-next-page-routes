"use client";

import * as React from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Todo } from "@/shared/schemas";
import { formatDueDateMs, localStartOfTodayMs } from "@/shared/schemas";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

type ListProps = {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  onToggle: (t: Todo) => void;
  onEdit: (t: Todo) => void;
  onDelete: (t: Todo) => void;
  onRetry: () => void;
};

const PRIORITY_BADGE_CLASS: Record<Todo["priority"], string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-amber-500 text-white",
  low: "bg-secondary text-secondary-foreground",
};

export function List({
  todos,
  loading,
  error,
  onToggle,
  onEdit,
  onDelete,
  onRetry,
}: ListProps) {
  const { t } = useTranslation(["common", "todo"]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("todo:loadFailed")}</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry}>{t("todo:retry")}</Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (todos.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("todo:empty.title")}</EmptyTitle>
          <EmptyDescription>{t("todo:empty.description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => {
        const overdue = !todo.completed && todo.dueDate < localStartOfTodayMs();
        return (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
          >
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => onToggle(todo)}
              aria-label={t("todo:aria.markComplete")}
            />
            <span
              className={cn(
                "flex-1 truncate text-sm",
                todo.completed && "line-through text-muted-foreground",
              )}
            >
              {todo.task}
            </span>
            <Badge className={PRIORITY_BADGE_CLASS[todo.priority]}>
              {t(`todo:priority.${todo.priority}`)}
            </Badge>
            <span
              className={cn(
                "text-xs tabular-nums",
                overdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {formatDueDateMs(todo.dueDate)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(todo)}
              aria-label={t("todo:aria.edit")}
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(todo)}
              aria-label={t("todo:aria.delete")}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
