import { FileText, Download } from "lucide-react";
import { useState } from "react";

import { ChatProductCardRow } from "@/components/chat/chat-product-card";
import { ChatQuotationCard } from "@/components/chat/chat-quotation-card";
import type { ChatMessageMetadata } from "@/lib/chat.types";
import { cn } from "@/lib/utils";

type Props = {
  body: string;
  metadata: ChatMessageMetadata;
  isVisitor: boolean;
  onQuotationResponded?: () => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatMessageContent({
  body,
  metadata,
  isVisitor,
  onQuotationResponded,
}: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const attachments = metadata.attachments ?? [];
  const productCards = metadata.productCards;
  const quotation = metadata.quotation;
  const showBody =
    body.trim() &&
    !["[รูปภาพ]", "[ไฟล์แนบ]", "[สินค้าแนะนำ]", "[ใบเสนอราคา]"].includes(
      body.trim(),
    );

  return (
    <>
      {showBody ? <p className="whitespace-pre-wrap">{body}</p> : null}

      {attachments.map((file, idx) => {
        const isImage = file.mime.startsWith("image/");
        if (isImage) {
          return (
            <button
              key={`${file.url}-${idx}`}
              type="button"
              className="mt-1 block overflow-hidden rounded-lg"
              onClick={() => setLightbox(file.url)}
            >
              <img
                src={file.thumbUrl ?? file.url}
                alt={file.fileName}
                className="max-h-48 max-w-full object-cover"
                loading="lazy"
              />
            </button>
          );
        }

        return (
          <a
            key={`${file.url}-${idx}`}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-2 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors",
              isVisitor
                ? "border-white/20 bg-white/10 hover:bg-white/15"
                : "border-border bg-background hover:bg-muted/50",
            )}
          >
            <FileText className="size-4 shrink-0 opacity-70" />
            <span className="min-w-0 flex-1 truncate">{file.fileName}</span>
            <span className="shrink-0 opacity-70">
              {formatBytes(file.sizeBytes)}
            </span>
            <Download className="size-3.5 shrink-0 opacity-70" />
          </a>
        );
      })}

      {productCards?.length ? (
        <ChatProductCardRow products={productCards} />
      ) : null}

      {quotation ? (
        <ChatQuotationCard
          quotation={quotation}
          onResponded={onQuotationResponded}
        />
      ) : null}

      {lightbox ? (
        <button
          type="button"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
          aria-label="Close"
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      ) : null}
    </>
  );
}
