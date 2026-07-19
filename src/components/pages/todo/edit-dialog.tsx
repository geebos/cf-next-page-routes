"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UpdateTodoForm } from "@/components/pages/todo/forms/todo-form";
import type { Todo, UpdateTodoInput } from "@/shared/schemas";

type EditDialogProps = {
  todo: Todo;
  onSubmit: (input: UpdateTodoInput) => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function EditDialog({ todo, onSubmit, onOpenChange }: EditDialogProps) {
  const { t } = useTranslation(["common", "todo"]);
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("todo:editDialog.title")}</DialogTitle>
          <DialogDescription>{t("todo:editDialog.description")}</DialogDescription>
        </DialogHeader>
        <UpdateTodoForm
          todo={todo}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
