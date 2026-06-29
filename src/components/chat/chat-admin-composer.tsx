import { FileText, Package, Search } from "lucide-react";
import { useCallback, useState } from "react";

import {
  ChatComposer,
  type ChatComposerSendPayload,
} from "@/components/chat/chat-composer";
import { ChatProductPicker } from "@/components/chat/chat-product-picker";
import { ChatQuotationPicker } from "@/components/chat/chat-quotation-picker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useT } from "@/i18n";
import type { ChatAttachment } from "@/lib/chat.types";
import type { ChatProductCardPayload } from "@/lib/chat.types";

type Props = {
  disabled?: boolean;
  customerUserId?: string | null;
  onSendText: (payload: ChatComposerSendPayload) => void | Promise<void>;
  onSendProducts: (productIds: string[], body?: string) => void | Promise<void>;
  onSendQuotation: (quotationId: string, body?: string) => void | Promise<void>;
  onPickFile: (file: File) => Promise<ChatAttachment>;
};

export function ChatAdminComposer({
  disabled,
  customerUserId,
  onSendText,
  onSendProducts,
  onSendQuotation,
  onPickFile,
}: Props) {
  const { t } = useT();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [quotationOpen, setQuotationOpen] = useState(false);

  const handleSend = useCallback(
    (payload: ChatComposerSendPayload) => onSendText(payload),
    [onSendText],
  );

  return (
    <div className="border-t bg-background">
      <div className="flex flex-wrap gap-1 border-b px-3 py-2">
        <Popover open={toolsOpen} onOpenChange={setToolsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={disabled}
            >
              <Package className="size-3.5" />
              {t("chat.staffTools")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
              onClick={() => {
                setToolsOpen(false);
                setProductOpen(true);
              }}
            >
              <Search className="size-4" />
              {t("chat.sendProduct")}
            </button>
            {customerUserId ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  setToolsOpen(false);
                  setQuotationOpen(true);
                }}
              >
                <FileText className="size-4" />
                {t("chat.sendQuotation")}
              </button>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>

      <ChatComposer
        disabled={disabled}
        showQuickReplies={false}
        onSend={handleSend}
        onPickFile={onPickFile}
      />

      <ChatProductPicker
        open={productOpen}
        onOpenChange={setProductOpen}
        onSend={(ids, body) => void onSendProducts(ids, body)}
      />

      {customerUserId ? (
        <ChatQuotationPicker
          open={quotationOpen}
          onOpenChange={setQuotationOpen}
          userId={customerUserId}
          onSend={(id, body) => void onSendQuotation(id, body)}
        />
      ) : null}
    </div>
  );
}
