import {
  createFileRoute,
  Link,
  redirect as routerRedirect,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { GoogleAuthButton, PasswordInput } from "@/components/auth/auth-fields";
import { PageLoading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";
import {
  translateAuthError,
  navigateAfterAuth,
  POST_AUTH_PATH,
  safeAuthRedirect,
} from "@/lib/auth-errors";
import { getSessionUser } from "@/lib/auth-session";

const loginSearchSchema = z.object({
  tab: z.enum(["login", "signup"]).optional().catch("login"),
  redirect: z.string().optional(),
});

type AuthView = "tabs" | "forgot" | "verify-email";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search) => loginSearchSchema.parse(search),
  pendingComponent: () => (
    <PageLoading variant="detail" className="min-h-screen" />
  ),
  beforeLoad: async ({ search }) => {
    const user = await getSessionUser();
    if (user) {
      const to = search.redirect
        ? safeAuthRedirect(search.redirect)
        : POST_AUTH_PATH;
      throw routerRedirect({ to });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { tab, redirect } = useSearch({ from: "/login" });
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();

  const [view, setView] = useState<AuthView>("tabs");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeTab = tab ?? "login";

  function goAfterAuth() {
    if (redirect) {
      void navigate({ to: safeAuthRedirect(redirect) });
      return;
    }
    navigateAfterAuth(navigate);
  }

  function setTab(next: "login" | "signup") {
    setFormError(null);
    setView("tabs");
    void navigate({
      to: "/login",
      search: { tab: next, redirect },
      replace: true,
    });
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("เข้าสู่ระบบสำเร็จ");
      goAfterAuth();
    } catch (err) {
      const message = translateAuthError(
        err instanceof Error ? err.message : "",
        "เข้าสู่ระบบไม่สำเร็จ",
      );
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (password !== confirmPassword) {
      const message = "รหัสผ่านไม่ตรงกัน";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (!acceptedTerms) {
      const message = "กรุณายอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว";
      setFormError(message);
      toast.error(message);
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, fullName.trim());
      if (result.needsEmailConfirmation) {
        setView("verify-email");
        toast.success("ส่งลิงก์ยืนยันไปที่อีเมลแล้ว");
      } else {
        toast.success("สมัครสมาชิกสำเร็จ");
        goAfterAuth();
      }
    } catch (err) {
      const message = translateAuthError(
        err instanceof Error ? err.message : "",
        "สมัครไม่สำเร็จ",
      );
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว");
      setView("tabs");
      setTab("login");
    } catch (err) {
      const message = translateAuthError(
        err instanceof Error ? err.message : "",
        "ส่งลิงก์ไม่สำเร็จ",
      );
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const subtitle =
    activeTab === "signup"
      ? t("auth.signup.subtitle")
      : t("auth.login.subtitle");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-primary to-[#126B68] p-12 text-white lg:flex lg:flex-col lg:justify-end">
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
        <p className="mt-4 max-w-md text-white/80">{subtitle}</p>
      </div>

      <div className="flex flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto mb-8 flex w-full max-w-md items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("nav.home")}
          </Link>
          <Link to="/" className="shrink-0">
            <img
              src="/brand/logo-mono-dark.png"
              alt="WP ALL"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          {view === "verify-email" ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MailCheck className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ยืนยันอีเมลของคุณ</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  เราส่งลิงก์ยืนยันไปที่{" "}
                  <span className="font-medium text-foreground">{email}</span>{" "}
                  แล้ว กรุณาเปิดอีเมลและกดลิงก์เพื่อเปิดใช้งานบัญชี
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setView("tabs");
                  setTab("login");
                }}
              >
                {t("auth.backToLogin")}
              </Button>
            </div>
          ) : view === "forgot" ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">ลืมรหัสผ่าน</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้
                </p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">{t("auth.email")}</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {formError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setFormError(null);
                    setView("tabs");
                  }}
                >
                  {t("auth.backToLogin")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-sm text-muted-foreground lg:hidden">
                {subtitle}
              </p>

              <Tabs
                value={activeTab}
                onValueChange={(value) => setTab(value as "login" | "signup")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">
                    {t("auth.login.title")}
                  </TabsTrigger>
                  <TabsTrigger value="signup">{t("nav.signup")}</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6 space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t("auth.email")}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="login-password">
                          {t("auth.password")}
                        </Label>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => {
                            setFormError(null);
                            setView("forgot");
                          }}
                        >
                          {t("auth.forgotPassword")}
                        </button>
                      </div>
                      <PasswordInput
                        id="login-password"
                        value={password}
                        onChange={setPassword}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    {formError && activeTab === "login" ? (
                      <p className="text-sm text-destructive" role="alert">
                        {formError}
                      </p>
                    ) : null}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        t("auth.login.title")
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6 space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-fullName">
                        {t("auth.fullName")}
                      </Label>
                      <Input
                        id="signup-fullName"
                        autoComplete="name"
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
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">
                        {t("auth.password")}
                      </Label>
                      <PasswordInput
                        id="signup-password"
                        value={password}
                        onChange={setPassword}
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("auth.passwordHint")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">
                        {t("auth.confirmPassword")}
                      </Label>
                      <PasswordInput
                        id="signup-confirm"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </div>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <Checkbox
                        checked={acceptedTerms}
                        onCheckedChange={(checked) =>
                          setAcceptedTerms(checked === true)
                        }
                        className="mt-0.5"
                      />
                      <span className="text-muted-foreground">
                        {t("auth.acceptTerms")}{" "}
                        <Link
                          to="/terms"
                          className="text-primary hover:underline"
                        >
                          ข้อกำหนด
                        </Link>{" "}
                        และ{" "}
                        <Link
                          to="/privacy"
                          className="text-primary hover:underline"
                        >
                          นโยบายความเป็นส่วนตัว
                        </Link>
                      </span>
                    </label>
                    {formError && activeTab === "signup" ? (
                      <p className="text-sm text-destructive" role="alert">
                        {formError}
                      </p>
                    ) : null}
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
              <GoogleAuthButton
                disabled={loading}
                onClick={() => void signInWithGoogle()}
              >
                {activeTab === "signup"
                  ? t("auth.googleSignup")
                  : t("auth.google")}
              </GoogleAuthButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
