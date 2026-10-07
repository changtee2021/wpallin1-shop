import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { ProductImage } from "@/components/storefront/product-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DEALER_ONBOARDING_STEPS,
  dealerSignupLineMessage,
  lineOaMessageUrl,
  type DealerIntentProduct,
} from "@/lib/dealer-onboarding";
import { siteConfig } from "@/lib/site-config";

type DealerGateProduct = DealerIntentProduct & { imageUrl: string | null };

type DealerGateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: DealerGateProduct | null;
};

const TITLE = "สั่งซื้อได้หลังเปิดบัญชีตัวแทน";
const DESCRIPTION = "เปิดบัญชีไม่มีค่าใช้จ่าย คุยกับเซลทาง LINE ครั้งเดียวจบ";

function Kicker() {
  return (
    <p className="brand-kicker flex items-center gap-3 text-primary">
      <span aria-hidden className="h-px w-8 bg-accent" />
      Dealer account
    </p>
  );
}

const titleClass =
  "mt-4 text-[1.75rem] leading-tight font-medium tracking-tight text-foreground";

function GateBody({ product }: { product?: DealerGateProduct | null }) {
  const { user } = useAuth();
  const returnTo = useLocation({ select: (location) => location.href });
  const lineHref = lineOaMessageUrl(dealerSignupLineMessage(product));
  const linkClass =
    "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline";

  return (
    <div className="mt-2">
      {product ? (
        <div className="flex items-center gap-4 border-y border-border py-3">
          <div className="size-14 shrink-0 overflow-hidden rounded-sm bg-surface">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              showLabel={false}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="brand-index mt-0.5 text-xs text-muted-foreground">
              {product.sku}
            </p>
          </div>
        </div>
      ) : null}

      <ol className="mt-2 divide-y divide-border">
        {DEALER_ONBOARDING_STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-5 py-4">
            <span className="brand-index pt-0.5 text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-[15px] font-medium leading-6">{step.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {user ? (
        <p className="border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
          คุณเข้าระบบด้วย <span className="text-foreground">{user.email}</span>{" "}
          บัญชีนี้ยังไม่ใช่ตัวแทน
        </p>
      ) : null}

      <a
        href={lineHref}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex h-12 w-full items-center justify-between rounded-full bg-[#06C755] pr-1.5 pl-6 text-[15px] font-medium text-white transition-colors hover:bg-[#05b34c]"
      >
        ทัก LINE {siteConfig.lineId}
        <span className="flex size-9 items-center justify-center rounded-full bg-white text-[#06C755]">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </a>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4">
        <Link to="/dealer/register" className={linkClass}>
          {user ? "สมัครออนไลน์ / ดูสถานะ" : "หรือสมัครออนไลน์"}
        </Link>
        {user ? null : (
          <Link
            to="/login"
            search={{ tab: "login", redirect: returnTo }}
            className={linkClass}
          >
            มีรหัสแล้ว? เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </div>
  );
}

/** Explains the dealer-only rule and the way in, instead of a dead "add to cart". */
export function DealerGateDialog({
  open,
  onOpenChange,
  product,
}: DealerGateDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-6 pt-8"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <SheetHeader className="p-0 text-left">
            <Kicker />
            <SheetTitle className={titleClass}>{TITLE}</SheetTitle>
            <SheetDescription>{DESCRIPTION}</SheetDescription>
          </SheetHeader>
          <GateBody product={product} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-2 rounded-lg p-8">
        <DialogHeader className="text-left">
          <Kicker />
          <DialogTitle className={titleClass}>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <GateBody product={product} />
      </DialogContent>
    </Dialog>
  );
}

export type { DealerGateProduct };
