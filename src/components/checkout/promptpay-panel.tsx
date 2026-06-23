import { buildPromptPayPayload, promptPayQrImageUrl } from "@/lib/promptpay";
import { formatPrice } from "@/lib/format";

export function PromptPayPanel({
  promptPayId,
  amount,
}: {
  promptPayId: string;
  amount: number;
}) {
  if (!promptPayId.trim()) return null;

  let payload: string;
  try {
    payload = buildPromptPayPayload(promptPayId, amount);
  } catch {
    return <p className="text-sm text-destructive">PromptPay ID ไม่ถูกต้อง</p>;
  }

  const qrUrl = promptPayQrImageUrl(payload);

  return (
    <div className="rounded-lg border bg-white p-4 text-center">
      <p className="mb-2 text-sm font-medium">สแกน PromptPay</p>
      <img
        src={qrUrl}
        alt="PromptPay QR"
        className="mx-auto size-48 rounded-md border"
      />
      <p className="mt-2 text-lg font-bold text-accent">
        {formatPrice(amount)}
      </p>
      <p className="text-xs text-muted-foreground">ID: {promptPayId}</p>
    </div>
  );
}
