const CART_SESSION_KEY = "wpall_cart_session";

export function getOrCreateCartSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CART_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, id);
  }
  return id;
}

export function clearCartSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_SESSION_KEY);
}
