import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChatUiContextValue = {
  open: boolean;
  openChat: () => void;
  closeChat: () => void;
};

const ChatUiContext = createContext<ChatUiContextValue | null>(null);

export function ChatUiProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openChat, closeChat }),
    [open, openChat, closeChat],
  );

  return (
    <ChatUiContext.Provider value={value}>{children}</ChatUiContext.Provider>
  );
}

export function useChatUi() {
  return useContext(ChatUiContext) ?? noopChatUi;
}

const noopChatUi: ChatUiContextValue = {
  open: false,
  openChat: () => {},
  closeChat: () => {},
};

/** Safe for shared headers/menus that render outside a layout-specific provider. */
export function useChatUiSafe() {
  return useContext(ChatUiContext) ?? noopChatUi;
}

export function useChatUiOptional() {
  return useContext(ChatUiContext);
}
