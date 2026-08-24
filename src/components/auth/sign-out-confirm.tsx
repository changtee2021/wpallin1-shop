import { useCallback, useState } from "react";

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
import { useAuth } from "@/hooks/use-auth";

export function useSignOutConfirm(onAfter?: () => void) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const requestSignOut = useCallback(() => {
    setOpen(true);
  }, []);

  function SignOutDialog() {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ออกจากระบบ?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อดูบัญชีและสั่งซื้อในฐานะสมาชิก
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                void signOut().then(() => onAfter?.());
              }}
            >
              ออกจากระบบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return { requestSignOut, SignOutDialog };
}
