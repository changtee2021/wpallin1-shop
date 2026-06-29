import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";

const loginSearchSchema = z.object({
  tab: z.enum(["login", "signup"]).optional().catch("login"),
});

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/login" });
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  function setTab(next: "login" | "signup") {
    void navigate({ to: "/login", search: { tab: next }, replace: true });
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("เข้าสู่ระบบสำเร็จ");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
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

  const activeTab = tab ?? "login";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <p className="text-3xl font-semibold leading-snug">
          {activeTab === "signup" ? (
            <>
              สร้างบัญชีเพื่อสั่งซื้อ
              <br />
              และติดตามออเดอร์
            </>
          ) : (
            <>
              ศูนย์กลางสั่งซื้อผ้าม่าน
              <br />
              สำหรับลูกค้าและตัวแทน
            </>
          )}
        </p>
        <p className="mt-4 max-w-md text-white/80">
          {activeTab === "signup"
            ? t("auth.signup.subtitle")
            : t("auth.login.subtitle")}
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setTab(value as "login" | "signup")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login.title")}</TabsTrigger>
              <TabsTrigger value="signup">{t("nav.signup")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold">{t("auth.login.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("auth.login.subtitle")}
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.email")}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("auth.password")}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t("auth.login.title")
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold">{t("auth.signup.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("auth.signup.subtitle")}
                </p>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullName">{t("auth.fullName")}</Label>
                  <Input
                    id="signup-fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("auth.email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("auth.password")}</Label>
                  <Input
                    id="signup-password"
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
            </TabsContent>
          </Tabs>

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
        </div>
      </div>
    </div>
  );
}
