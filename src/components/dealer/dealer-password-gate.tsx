import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/auth-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  dealerAccountQueryKey,
  useDealerAccount,
} from "@/hooks/use-dealer-account";
import { completeDealerPasswordChange } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";

/** Accounts opened by sales start with a one-time password sent over LINE; the dealer must replace it before using the shop. */
export function DealerPasswordGate() {
  const { user, session, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data: account } = useDealerAccount();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [saving, setSaving] = useState(false);

  if (!account?.mustChangePassword) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (password.length < 8) next.password = "อย่างน้อย 8 ตัวอักษร";
    if (confirm !== password) next.confirm = "รหัสผ่านไม่ตรงกัน";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await completeDealerPasswordChange({
        data: { newPassword: password },
        ...authServerFnOptions(session),
      });
      await queryClient.invalidateQueries({
        queryKey: dealerAccountQueryKey(user?.id),
      });
      toast.success("ตั้งรหัสผ่านใหม่แล้ว");
      setPassword("");
      setConfirm("");
    } catch (err) {
      const message =
        err instanceof Error && /[\u0E00-\u0E7F]/.test(err.message)
          ? err.message
          : "เปลี่ยนรหัสผ่านไม่สำเร็จ";
      setErrors({ password: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-5" aria-hidden />
          </div>
          <DialogTitle>ตั้งรหัสผ่านของคุณ</DialogTitle>
          <DialogDescription>
            บัญชี {account.dealerCode} ใช้รหัสผ่านชั่วคราวจากเซล
            กรุณาตั้งรหัสผ่านใหม่ก่อนเริ่มสั่งซื้อ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dealer-new-password">รหัสผ่านใหม่</Label>
            <PasswordInput
              id="dealer-new-password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              autoComplete="new-password"
              minLength={8}
              required
              invalid={Boolean(errors.password)}
              describedBy={
                errors.password ? "dealer-new-password-error" : undefined
              }
            />
            <FieldError id="dealer-new-password-error">
              {errors.password}
            </FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dealer-confirm-password">ยืนยันรหัสผ่านใหม่</Label>
            <PasswordInput
              id="dealer-confirm-password"
              value={confirm}
              onChange={(value) => {
                setConfirm(value);
                setErrors((prev) => ({ ...prev, confirm: undefined }));
              }}
              autoComplete="new-password"
              minLength={8}
              required
              invalid={Boolean(errors.confirm)}
              describedBy={
                errors.confirm ? "dealer-confirm-password-error" : undefined
              }
            />
            <FieldError id="dealer-confirm-password-error">
              {errors.confirm}
            </FieldError>
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-full"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              "บันทึกรหัสผ่านใหม่"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full rounded-full"
            onClick={() => void signOut()}
          >
            ออกจากระบบ
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
