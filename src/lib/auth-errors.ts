const AUTH_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "Email not confirmed": "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
  "User already registered": "อีเมลนี้มีบัญชีแล้ว — ลองเข้าสู่ระบบ",
  "Password should be at least 6 characters":
    "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
  "Unable to validate email address: invalid format": "รูปแบบอีเมลไม่ถูกต้อง",
  "Signup requires a valid password": "กรุณากรอกรหัสผ่านที่ถูกต้อง",
  "For security purposes, you can only request this once every 60 seconds":
    "กรุณารอสักครู่แล้วลองส่งอีกครั้ง",
};

export const POST_AUTH_PATH = "/shop" as const;

export function translateAuthError(message: string, fallback: string): string {
  return AUTH_ERROR_MAP[message] ?? fallback;
}

export function safeAuthRedirect(redirect?: string): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return POST_AUTH_PATH;
  }
  return redirect;
}

export function navigateAfterAuth(
  navigate: (options: { to: typeof POST_AUTH_PATH }) => void,
) {
  navigate({ to: POST_AUTH_PATH });
}
