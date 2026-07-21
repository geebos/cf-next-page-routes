"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Page } from "@/components/layout/page";
import { Seo } from "@/components/i18n/Seo";
import { Section } from "@/components/ui/section";
import { CreateTodoForm } from "@/components/pages/todo/forms/todo-form";
import { EditDialog } from "@/components/pages/todo/edit-dialog";
import { DeleteDialog } from "@/components/pages/todo/delete-dialog";
import { List } from "@/components/pages/todo/list";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  ApiError,
} from "@/lib/api";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "@/shared/schemas";
import { getLocaleStaticPaths, makeStaticProps } from "@/lib/i18n-static";

function apiErrorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError && e.message ? e.message : fallback;
}

export default function TodoPage() {
  const { t } = useTranslation(["common", "todo"]);
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editingTodo, setEditingTodo] = React.useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = React.useState<Todo | null>(null);

  const refresh = React.useCallback(async () => {
    setError(null);
    try {
      setTodos(await listTodos());
    } catch (e) {
      setError(apiErrorMessage(e, t("todo:loadFailed")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    const run = async () => {
      await refresh();
    };
    void run();
  }, [refresh]);

  async function handleCreate(input: CreateTodoInput) {
    try {
      await createTodo(input);
      await refresh();
      toast.success(t("todo:toast.added"));
    } catch (e) {
      toast.error(apiErrorMessage(e, t("todo:toast.addFailed")));
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      await updateTodo(todo.id, { completed: !todo.completed });
      await refresh();
      toast.success(
        todo.completed ? t("todo:toast.uncompleted") : t("todo:toast.completed"),
      );
    } catch (e) {
      toast.error(apiErrorMessage(e, t("todo:toast.operationFailed")));
    }
  }

  async function handleUpdate(input: UpdateTodoInput) {
    if (!editingTodo) return;
    try {
      await updateTodo(editingTodo.id, input);
      setEditingTodo(null);
      await refresh();
      toast.success(t("todo:toast.saved"));
    } catch (e) {
      toast.error(apiErrorMessage(e, t("todo:toast.saveFailed")));
    }
  }

  async function handleDelete() {
    if (!deletingTodo) return;
    try {
      await deleteTodo(deletingTodo.id);
      // B: do NOT setDeletingTodo(null) here — dialog closes via onOpenChange
      await refresh();
      toast.success(t("todo:toast.deleted"));
    } catch (e) {
      toast.error(apiErrorMessage(e, t("todo:toast.deleteFailed")));
      throw e; // rethrow so dialog stays open on failure
    }
  }

  return (
    <Page>
      <Seo
        title={t("todo:metaTitle")}
        description={t("todo:metaDescription")}
        path="/todo"
      />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
        <header>
          <h1 className="font-heading text-[28px] font-semibold tracking-tight">
            {t("todo:title")}
          </h1>
        </header>

        <Section className="rounded-lg border border-border bg-card p-4">
          <CreateTodoForm onSubmit={handleCreate} />
        </Section>

        <Section>
          <List
            todos={todos}
            loading={loading}
            error={error}
            onToggle={handleToggle}
            onEdit={setEditingTodo}
            onDelete={setDeletingTodo}
            onRetry={refresh}
          />
        </Section>
      </div>

      {editingTodo && (
        <EditDialog
          todo={editingTodo}
          onSubmit={handleUpdate}
          onOpenChange={(open) => {
            if (!open) setEditingTodo(null);
          }}
        />
      )}
      {deletingTodo && (
        <DeleteDialog
          onConfirm={handleDelete}
          onOpenChange={(open) => {
            if (!open) setDeletingTodo(null);
          }}
        />
      )}
    </Page>
  );
}

export const getStaticPaths = getLocaleStaticPaths;
export const getStaticProps = makeStaticProps(["common", "todo"]);
