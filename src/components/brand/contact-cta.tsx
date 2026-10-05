import { ArrowUpRight, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import { useBi, type Bi } from "@/lib/bi";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type ContactLineButtonProps = {
  variant?: "solid" | "outline" | "inverse";
  size?: "default" | "lg";
  className?: string;
  label?: string;
};

/** Primary enquiry action on brand pages — always opens LINE OA, never a quote form. */
export function ContactLineButton({
  variant = "solid",
  size = "lg",
  className,
  label,
}: ContactLineButtonProps) {
  const { t } = useT();

  return (
    <Button
      size={size}
      variant={variant === "outline" ? "outline" : "default"}
      className={cn(
        "group rounded-full",
        size === "lg" ? "h-12 px-7" : "h-11 px-5",
        variant === "solid" &&
          "bg-foreground text-background hover:bg-foreground/85",
        variant === "inverse" && "bg-white text-foreground hover:bg-white/90",
        className,
      )}
      asChild
    >
      <a href={siteConfig.lineUrl} target="_blank" rel="noreferrer">
        <MessageCircle className="mr-2 size-4" aria-hidden />
        {label ?? t("site.cta.contact")}
        <ArrowUpRight
          className="ml-1.5 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden
        />
      </a>
    </Button>
  );
}

type ContactCtaBandProps = {
  kicker?: string;
  title?: Bi;
  description?: Bi;
};

/** Closing band shared by product pages: dark, calm, one action. */
export function ContactCtaBand({
  kicker = "Contact",
  title = {
    th: "อยากเห็นของจริง หรือให้เราช่วยออกแบบ?",
    en: "Want to see it in person, or need help with the design?",
  },
  description = {
    th: "ทีมงานพร้อมให้คำแนะนำเรื่องรุ่น วัสดุ ขนาด และการติดตั้ง คุยกับเราได้ทาง LINE",
    en: "Our team can advise on models, materials, sizing and installation. Reach us on LINE.",
  },
}: ContactCtaBandProps) {
  const pick = useBi();

  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="brand-kicker text-accent">{kicker}</p>
          <h2 className="brand-heading mt-4 text-white">{pick(title)}</h2>
          <p className="mt-4 text-base leading-7 text-white/65 text-pretty">
            {pick(description)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <ContactLineButton variant="inverse" />
          <p className="text-xs text-white/50">LINE {siteConfig.lineId}</p>
        </div>
      </div>
    </section>
  );
}
