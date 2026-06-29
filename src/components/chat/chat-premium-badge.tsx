import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n";
import type { ChatAiAccess } from "@/lib/chat-ai-eligibility";

type Props = {
  aiAccess: ChatAiAccess;
};

export function ChatPremiumBadge({ aiAccess }: Props) {
  const { t } = useT();

  if (aiAccess.mode === "premium" && aiAccess.canUseLlm) {
    return (
      <Badge variant="secondary" className="text-[10px] font-normal">
        {t("chat.premiumBadge")}
      </Badge>
    );
  }

  if (aiAccess.reason === "retail") {
    return (
      <p className="text-[10px] leading-snug text-white/70">
        {t("chat.upsell").replace(
          "{amount}",
          aiAccess.minSpendRequired.toLocaleString("th-TH"),
        )}
      </p>
    );
  }

  if (aiAccess.reason === "quota") {
    return (
      <p className="text-[10px] text-white/70">{t("chat.quotaReached")}</p>
    );
  }

  return null;
}
