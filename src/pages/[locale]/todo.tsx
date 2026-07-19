"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Page } from "@/components/layout/page";
import { Seo } from "@/components/i18n/Seo";
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
      const msg =
        e instanceof ApiError && e.message
          ? e.message
          : t("todo:loadFailed");
      setError(msg);
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
      toast.error(
        e instanceof ApiError && e.message
          ? e.message
          : t("todo:toast.addFailed"),
      );
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
      toast.error(
        e instanceof ApiError && e.message
          ? e.message
          : t("todo:toast.operationFailed"),
      );
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
      toast.error(
        e instanceof ApiError && e.message
          ? e.message
          : t("todo:toast.saveFailed"),
      );
    }
  }

  async function handleDelete() {
    if (!deletingTodo) return;
    try {
      await deleteTodo(deletingTodo.id);
      setDeletingTodo(null);
      await refresh();
      toast.success(t("todo:toast.deleted"));
    } catch (e) {
      toast.error(
        e instanceof ApiError && e.message
          ? e.message
          : t("todo:toast.deleteFailed"),
      );
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

        <section className="rounded-lg border border-border bg-card p-4">
          <CreateTodoForm onSubmit={handleCreate} />
        </section>

        <section>
          <List
            todos={todos}
            loading={loading}
            error={error}
            onToggle={handleToggle}
            onEdit={setEditingTodo}
            onDelete={setDeletingTodo}
            onRetry={refresh}
          />
        </section>
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
