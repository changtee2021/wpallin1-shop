import { Link } from "@tanstack/react-router";
import { Bell, ExternalLink, Loader2, Shield } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import type { useT } from "@/i18n";

type SystemSettingsPanelProps = {
  email: string | null;
  locale: "th" | "en";
  setLocale: (v: "th" | "en") => void;
  savingProfile: boolean;
  onSaveSettings: () => void;
  onSignOut: () => void;
  t: ReturnType<typeof useT>["t"];
};

export function SystemSettingsPanel({
  email,
  locale,
  setLocale,
  savingProfile,
  onSaveSettings,
  onSignOut,
  t,
}: SystemSettingsPanelProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("เปลี่ยนรหัสผ่านแล้ว");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ทั่วไป</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-w-xs gap-2">
            <Label>ภาษา / Language</Label>
            <Select
              value={locale}
              onValueChange={(v) => setLocale(v as "th" | "en")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="th">ไทย</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onSaveSettings} disabled={savingProfile}>
            {savingProfile && <Loader2 className="mr-2 size-4 animate-spin" />}
            บันทึกการตั้งค่า
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4" />
            การแจ้งเตือน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            ดูประวัติแจ้งเตือนออเดอร์ การชำระเงิน และกิจกรรมบัญชี
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/account/notifications">เปิดศูนย์แจ้งเตือน</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" />
            ความปลอดภัย
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-w-md gap-2">
            <Label>อีเมลที่ใช้ล็อกอิน</Label>
            <Input value={email ?? ""} disabled />
          </div>
          <form
            onSubmit={(e) => void handleChangePassword(e)}
            className="grid max-w-md gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
              />
            </div>
            <Button type="submit" variant="outline" disabled={changingPassword}>
              {changingPassword && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              เปลี่ยนรหัสผ่าน
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ความเป็นส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-2">
          <Button variant="link" className="h-auto p-0" asChild>
            <Link to="/terms" className="inline-flex items-center gap-1">
              {t("footer.terms")}
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
          <Button variant="link" className="h-auto p-0" asChild>
            <Link to="/privacy" className="inline-flex items-center gap-1">
              {t("footer.privacy")}
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
          <Button variant="link" className="h-auto p-0" asChild>
            <Link to="/cookies" className="inline-flex items-center gap-1">
              {t("footer.cookies")}
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">เกี่ยวกับ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            เวอร์ชันแอป:{" "}
            <span className="font-mono text-foreground">
              {import.meta.env.VITE_APP_VERSION ?? "dev"}
            </span>
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/contact">ติดต่อทีมงาน</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <Separator />
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              ออกจากระบบจากอุปกรณ์นี้
            </p>
            <Button variant="outline" onClick={onSignOut}>
              {t("nav.logout")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
