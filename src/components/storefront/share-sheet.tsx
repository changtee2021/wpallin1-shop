import { Link2, Mail, Share2 } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { FacebookMonoIcon } from "@/components/icons/brand/facebook-mono";
import { LineMonoIcon } from "@/components/icons/brand/line-mono";
import { WechatMonoIcon } from "@/components/icons/brand/wechat-mono";
import { WhatsappMonoIcon } from "@/components/icons/brand/whatsapp-mono";
import { XMonoIcon } from "@/components/icons/brand/x-mono";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  sheetTitle: string;
};

type ShareOption = {
  id: string;
  label: string;
  icon: ReactNode;
  className?: string;
  onClick: () => void;
};

function openShareWindow(shareUrl: string) {
  window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=480");
}

export function ShareSheet({
  open,
  onOpenChange,
  title,
  url,
  sheetTitle,
}: Props) {
  const { t } = useT();

  const close = () => onOpenChange(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("share.linkCopied"));
      close();
    } catch {
      toast.error(t("share.failed"));
    }
  };

  const copyForWeChat = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n${url}`);
      toast.success(t("share.wechatCopied"));
      close();
    } catch {
      toast.error(t("share.failed"));
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      void copyLink();
      return;
    }
    try {
      await navigator.share({ title, url });
      close();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error(t("share.failed"));
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title}\n${url}`);

  const options: ShareOption[] = [
    {
      id: "copy",
      label: t("share.copyLink"),
      icon: <Link2 className="size-5" />,
      className: "bg-muted text-foreground hover:bg-muted/80",
      onClick: () => void copyLink(),
    },
    {
      id: "line",
      label: t("share.line"),
      icon: <LineMonoIcon className="size-5" aria-hidden />,
      className: "bg-[#06C755] text-white hover:bg-[#06C755]/90",
      onClick: () => {
        openShareWindow(
          `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
        );
        close();
      },
    },
    {
      id: "whatsapp",
      label: t("share.whatsapp"),
      icon: <WhatsappMonoIcon className="size-5" aria-hidden />,
      className: "bg-[#25D366] text-white hover:bg-[#25D366]/90",
      onClick: () => {
        openShareWindow(`https://wa.me/?text=${encodedText}`);
        close();
      },
    },
    {
      id: "wechat",
      label: t("share.wechat"),
      icon: <WechatMonoIcon className="size-5" aria-hidden />,
      className: "bg-[#07C160] text-white hover:bg-[#07C160]/90",
      onClick: () => void copyForWeChat(),
    },
    {
      id: "facebook",
      label: t("share.facebook"),
      icon: <FacebookMonoIcon className="size-5" aria-hidden />,
      className: "bg-[#1877F2] text-white hover:bg-[#1877F2]/90",
      onClick: () => {
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        );
        close();
      },
    },
    {
      id: "x",
      label: t("share.x"),
      icon: <XMonoIcon className="size-5" aria-hidden />,
      className: "bg-foreground text-background hover:bg-foreground/90",
      onClick: () => {
        openShareWindow(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        );
        close();
      },
    },
    {
      id: "email",
      label: t("share.email"),
      icon: <Mail className="size-5" />,
      className: "bg-muted text-foreground hover:bg-muted/80",
      onClick: () => {
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedText}`;
        close();
      },
    },
  ];

  if (typeof navigator !== "undefined" && navigator.share) {
    options.push({
      id: "more",
      label: t("share.more"),
      icon: <Share2 className="size-5" />,
      className: "bg-primary text-primary-foreground hover:bg-primary/90",
      onClick: () => void nativeShare(),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>{sheetTitle}</SheetTitle>
          <SheetDescription className="line-clamp-2">{title}</SheetDescription>
        </SheetHeader>

        <p className="mt-2 truncate rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          {url}
        </p>

        <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="flex flex-col items-center gap-2 text-center"
              onClick={option.onClick}
            >
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-full shadow-sm transition-transform active:scale-95",
                  option.className,
                )}
              >
                {option.icon}
              </span>
              <span className="text-[11px] leading-tight text-muted-foreground sm:text-xs">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full"
          onClick={close}
        >
          {t("share.close")}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
