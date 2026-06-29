import { ImagePlus, Paperclip, Plus, Send, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/i18n";
import { CHAT_FILE_ACCEPT } from "@/lib/chat.types";
import type { ChatAttachment } from "@/lib/chat.types";

const QUICK_REPLIES_TH = [
  "วิธีจัดส่ง",
  "ชำระเงินยังไง",
  "สมัครตัวแทน",
  "หาม่านห้องนอน",
  "คุยเจ้าหน้าที่",
];

const QUICK_REPLIES_EN = [
  "Shipping info",
  "Payment methods",
  "Become a dealer",
  "Bedroom curtains",
  "Talk to staff",
];

export type ChatComposerSendPayload = {
  text?: string;
  attachments?: ChatAttachment[];
};

type Props = {
  disabled?: boolean;
  showQuickReplies?: boolean;
  onSend: (payload: ChatComposerSendPayload) => void | Promise<void>;
  onHandoff?: () => void;
  onPickFile?: (file: File) => Promise<ChatAttachment>;
};

export function ChatComposer({
  disabled,
  showQuickReplies = true,
  onSend,
  onHandoff,
  onPickFile,
}: Props) {
  const { t, locale } = useT();
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<ChatAttachment | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const quickReplies = locale === "en" ? QUICK_REPLIES_EN : QUICK_REPLIES_TH;

  async function submit() {
    const trimmed = text.trim();
    if (disabled || uploading) return;

    if (
      trimmed &&
      (trimmed.includes("คุยเจ้าหน้าที่") ||
        trimmed.toLowerCase().includes("talk to staff"))
    ) {
      onHandoff?.();
      setText("");
      return;
    }

    if (!trimmed && !pending) return;

    await onSend({
      text: trimmed || undefined,
      attachments: pending ? [pending] : undefined,
    });
    setText("");
    setPending(null);
    setUploadPct(0);
  }

  async function handleFile(file: File) {
    if (!onPickFile || disabled) return;
    setUploading(true);
    setUploadPct(0);
    try {
      const attachment = await onPickFile(file);
      setPending(attachment);
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  }

  return (
    <div className="border-t bg-background p-3">
      {showQuickReplies ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {quickReplies.map((label) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (label.includes("คุย") || label.includes("Talk")) {
                  onHandoff?.();
                } else {
                  void onSend({ text: label });
                }
              }}
              className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {pending ? (
        <div className="mb-2 flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
          {pending.mime.startsWith("image/") ? (
            <img
              src={pending.thumbUrl ?? pending.url}
              alt=""
              className="size-10 rounded object-cover"
            />
          ) : (
            <Paperclip className="size-4 text-muted-foreground" />
          )}
          <span className="min-w-0 flex-1 truncate text-xs">
            {pending.fileName}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setPending(null)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : null}

      {uploading ? <Progress value={uploadPct} className="mb-2 h-1" /> : null}

      <form
        className="flex items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {onPickFile ? (
          <>
            <input
              ref={imageRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void handleFile(file);
              }}
            />
            <input
              ref={fileRef}
              type="file"
              accept={CHAT_FILE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void handleFile(file);
              }}
            />
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0"
                  disabled={disabled || uploading}
                  aria-label={t("chat.attach")}
                >
                  <Plus className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="start" side="top">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                  onClick={() => {
                    setMenuOpen(false);
                    imageRef.current?.click();
                  }}
                >
                  <ImagePlus className="size-4" />
                  {t("chat.attachImage")}
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                  onClick={() => {
                    setMenuOpen(false);
                    fileRef.current?.click();
                  }}
                >
                  <Paperclip className="size-4" />
                  {t("chat.attachFile")}
                </button>
              </PopoverContent>
            </Popover>
          </>
        ) : null}

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat.placeholder")}
          disabled={disabled || uploading}
          className="h-9 min-w-0 flex-1 text-sm"
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0"
          disabled={disabled || uploading || (!text.trim() && !pending)}
          aria-label={t("chat.send")}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
