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
import { FieldError } from "@/components/ui/field-error";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { signInWithDealerCode } from "@/lib/api.functions";
import {
  looksLikeDealerCode,
  normalizeDealerCode,
} from "@/lib/dealer-provinces";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const activeTab = tab ?? "login";

  function goAfterAuth() {
    if (redirect) {
      void navigate({ to: safeAuthRedirect(redirect) });
      return;
    }
    navigateAfterAuth(navigate);
  }

  function setTab(next: "login" | "signup") {
    setFieldErrors({});
    setView("tabs");
    void navigate({
      to: "/login",
      search: { tab: next, redirect },
      replace: true,
    });
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const identifier = email.trim();
    const isDealerCode = looksLikeDealerCode(identifier);
    if (!identifier) nextErrors.email = "กรอกอีเมลหรือรหัสตัวแทน";
    else if (!isDealerCode && !identifier.includes("@")) {
      nextErrors.email = "กรอกอีเมล หรือรหัสตัวแทนแบบ WPD-BKK-0001";
    }
    if (!password) nextErrors.password = "กรอกรหัสผ่าน";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      if (isDealerCode) {
        const tokens = await signInWithDealerCode({
          data: { code: normalizeDealerCode(identifier), password },
        });
        const { error } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });
        if (error) throw error;
      } else {
        await signIn(identifier, password);
      }
      toast.success("เข้าสู่ระบบสำเร็จ");
      goAfterAuth();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message =
        isDealerCode && /[\u0E00-\u0E7F]/.test(raw)
          ? raw
          : translateAuthError(raw, "เข้าสู่ระบบไม่สำเร็จ");
      setFieldErrors({ password: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors.fullName = "กรอกชื่อ-นามสกุล";
    if (!email.trim()) nextErrors.email = "กรอกอีเมล";
    if (!password) nextErrors.password = "กรอกรหัสผ่าน";
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    if (!acceptedTerms) {
      nextErrors.terms = "กรุณายอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = Object.values(nextErrors)[0];
      toast.error(first);
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
      setFieldErrors({ email: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setFieldErrors({ email: "กรอกอีเมล" });
      return;
    }
    setFieldErrors({});
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
      setFieldErrors({ email: message });
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
    <main id="main-content" className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-primary to-primary/80 p-12 text-white lg:flex lg:flex-col lg:justify-end">
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
              src="/brand/logo-color.png"
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    required
                    aria-invalid={Boolean(fieldErrors.email) || undefined}
                    aria-describedby={
                      fieldErrors.email ? "forgot-email-error" : undefined
                    }
                  />
                  <FieldError id="forgot-email-error">
                    {fieldErrors.email}
                  </FieldError>
                </div>
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
                    setFieldErrors({});
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
                      <Label htmlFor="login-email">
                        {t("auth.email")} / รหัสตัวแทน
                      </Label>
                      <Input
                        id="login-email"
                        type="text"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        autoComplete="username"
                        placeholder="you@example.com หรือ WPD-BKK-0001"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        required
                        aria-invalid={Boolean(fieldErrors.email) || undefined}
                        aria-describedby={
                          fieldErrors.email ? "login-email-error" : undefined
                        }
                      />
                      <FieldError id="login-email-error">
                        {fieldErrors.email}
                      </FieldError>
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
                            setFieldErrors({});
                            setView("forgot");
                          }}
                        >
                          {t("auth.forgotPassword")}
                        </button>
                      </div>
                      <PasswordInput
                        id="login-password"
                        value={password}
                        onChange={(value) => {
                          setPassword(value);
                          setFieldErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        autoComplete="current-password"
                        required
                        invalid={Boolean(fieldErrors.password)}
                        describedBy={
                          fieldErrors.password
                            ? "login-password-error"
                            : undefined
                        }
                      />
                      <FieldError id="login-password-error">
                        {fieldErrors.password}
                      </FieldError>
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
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                        }}
                        required
                        aria-invalid={
                          Boolean(fieldErrors.fullName) || undefined
                        }
                        aria-describedby={
                          fieldErrors.fullName
                            ? "signup-fullName-error"
                            : undefined
                        }
                      />
                      <FieldError id="signup-fullName-error">
                        {fieldErrors.fullName}
                      </FieldError>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t("auth.email")}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        required
                        aria-invalid={Boolean(fieldErrors.email) || undefined}
                        aria-describedby={
                          fieldErrors.email ? "signup-email-error" : undefined
                        }
                      />
                      <FieldError id="signup-email-error">
                        {fieldErrors.email}
                      </FieldError>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">
                        {t("auth.password")}
                      </Label>
                      <PasswordInput
                        id="signup-password"
                        value={password}
                        onChange={(value) => {
                          setPassword(value);
                          setFieldErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        invalid={Boolean(fieldErrors.password)}
                        describedBy={
                          fieldErrors.password
                            ? "signup-password-error"
                            : undefined
                        }
                      />
                      <FieldError id="signup-password-error">
                        {fieldErrors.password}
                      </FieldError>
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
                        onChange={(value) => {
                          setConfirmPassword(value);
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: "",
                          }));
                        }}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        invalid={Boolean(fieldErrors.confirmPassword)}
                        describedBy={
                          fieldErrors.confirmPassword
                            ? "signup-confirm-error"
                            : undefined
                        }
                      />
                      <FieldError id="signup-confirm-error">
                        {fieldErrors.confirmPassword}
                      </FieldError>
                    </div>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <Checkbox
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => {
                          setAcceptedTerms(checked === true);
                          setFieldErrors((prev) => ({ ...prev, terms: "" }));
                        }}
                        className="mt-0.5"
                        aria-invalid={Boolean(fieldErrors.terms) || undefined}
                        aria-describedby={
                          fieldErrors.terms ? "signup-terms-error" : undefined
                        }
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
                    <FieldError id="signup-terms-error">
                      {fieldErrors.terms}
                    </FieldError>
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
    </main>
  );
}
