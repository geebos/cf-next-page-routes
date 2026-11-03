"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

type DeleteDialogProps = {
  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function DeleteDialog({ onConfirm, onOpenChange }: DeleteDialogProps) {
  const { t } = useTranslation(["common", "todo"]);
  const [pending, setPending] = React.useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      onOpenChange(false); // success only (ownership B)
    } catch {
      // leave open; parent already toasts
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open
      onOpenChange={(next) => {
        if (!next && pending) return; // ignore dismiss while pending
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("todo:deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("todo:deleteDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {t("todo:button.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Radix Close: composeEventHandlers honors defaultPrevented
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={pending}
            aria-busy={pending}
          >
            {pending && <Spinner className="size-4" />}
            {t("todo:deleteDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
