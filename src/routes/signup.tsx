import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";

export const Route = createFileRoute("/signup")({
  ssr: false,
  component: SignupPage,
});

function SignupPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      toast.success("สมัครสมาชิกสำเร็จ — ตรวจสอบอีเมลยืนยันหากจำเป็น");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-violet-800 p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <p className="text-3xl font-semibold leading-snug">
          สร้างบัญชีเพื่อสั่งซื้อและติดตามออเดอร์
        </p>
        <p className="mt-4 max-w-md text-white/80">
          {t("auth.signup.subtitle")}
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{t("auth.signup.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("auth.signup.subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("auth.fullName")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t("auth.signup.title")
              )}
            </Button>
          </form>
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              {t("auth.orContinue")}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={() => void signInWithGoogle()}
          >
            {t("auth.google")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              {t("nav.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
