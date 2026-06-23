const AFFILIATE_KEY = "wpall_affiliate_ref";

export function captureAffiliateRefFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    localStorage.setItem(AFFILIATE_KEY, ref.trim().toUpperCase());
  }
}

export function getAffiliateRef(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AFFILIATE_KEY);
}
