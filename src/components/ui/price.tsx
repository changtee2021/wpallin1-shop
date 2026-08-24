import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

export function Price({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>{formatPrice(amount)}</span>
  );
}
