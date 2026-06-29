import { useCallback, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type AdminConfirmOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export function useAdminConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AdminConfirmOptions>({
    description: "",
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: string | AdminConfirmOptions) => {
    const normalized: AdminConfirmOptions =
      typeof opts === "string" ? { description: opts } : opts;

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(normalized);
      setOpen(true);
    });
  }, []);

  function handleClose(result: boolean) {
    setOpen(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  function AdminConfirmDialog() {
    return (
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) handleClose(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options.title ?? "ยืนยันการทำรายการ"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleClose(false)}>
              {options.cancelLabel ?? "ยกเลิก"}
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                options.destructive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
              onClick={() => handleClose(true)}
            >
              {options.confirmLabel ?? "ยืนยัน"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return { confirm, AdminConfirmDialog };
}
