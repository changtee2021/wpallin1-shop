import { Text } from "@react-email/components";

import { BaseEmailLayout, emailTextStyle } from "@/emails/base-layout";

type OrderStatusEmailProps = {
  orderNumber: string;
  status: string;
  href: string;
};

export function OrderStatusEmail({
  orderNumber,
  status,
  href,
}: OrderStatusEmailProps) {
  return (
    <BaseEmailLayout
      preview={`ออเดอร์ ${orderNumber} — ${status}`}
      title="สถานะออเดอร์อัปเดต"
      ctaHref={href}
      ctaLabel="ติดตามออเดอร์"
    >
      <Text style={emailTextStyle}>
        ออเดอร์ {orderNumber} มีการอัปเดตสถานะเป็น {status}
      </Text>
    </BaseEmailLayout>
  );
}
