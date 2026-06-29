const STORAGE_KEY = "wpall_chat_guest_session";

export function getGuestChatSessionId(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

export function getStoredConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wpall_chat_conversation_id");
}

export function setStoredConversationId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem("wpall_chat_conversation_id", id);
  else localStorage.removeItem("wpall_chat_conversation_id");
}
