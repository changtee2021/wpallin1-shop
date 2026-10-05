import { FacebookMonoIcon } from "@/components/icons/brand/facebook-mono";
import { LineMonoIcon } from "@/components/icons/brand/line-mono";
import { WhatsappMonoIcon } from "@/components/icons/brand/whatsapp-mono";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const brandClass: Record<string, string> = {
  LINE: "bg-[#06C755] text-white hover:brightness-95",
  Facebook: "bg-[#1877F2] text-white hover:brightness-95",
  WhatsApp: "bg-[#25D366] text-white hover:brightness-95",
  YouTube: "bg-[#FF0000] text-white hover:brightness-95",
};

function SocialIcon({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  if (label === "LINE")
    return <LineMonoIcon className={className} aria-hidden />;
  if (label === "Facebook") {
    return <FacebookMonoIcon className={className} aria-hidden />;
  }
  if (label === "WhatsApp") {
    return <WhatsappMonoIcon className={className} aria-hidden />;
  }
  return (
    <span
      className={cn("text-[10px] font-bold leading-none", className)}
      aria-hidden
    >
      {label.slice(0, 2)}
    </span>
  );
}

type SocialLinksProps = {
  className?: string;
  size?: number;
};

export function SocialLinks({ className, size = 34 }: SocialLinksProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {siteConfig.social.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
          className={cn(
            "inline-flex items-center justify-center rounded-full transition-opacity active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            brandClass[item.label] ?? "bg-foreground text-background",
          )}
          style={{ width: size, height: size }}
        >
          <SocialIcon label={item.label} className="size-[55%]" />
        </a>
      ))}
    </div>
  );
}
