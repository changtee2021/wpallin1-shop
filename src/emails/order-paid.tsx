import { Text } from "@react-email/components";

import { BaseEmailLayout, emailTextStyle } from "@/emails/base-layout";

type OrderPaidEmailProps = {
  orderNumber: string;
  href: string;
};

export function OrderPaidEmail({ orderNumber, href }: OrderPaidEmailProps) {
  return (
    <BaseEmailLayout
      preview={`ยืนยันการชำระเงินออเดอร์ ${orderNumber}`}
      title="ชำระเงินสำเร็จ"
      ctaHref={href}
      ctaLabel="ดูรายละเอียดออเดอร์"
    >
      <Text style={emailTextStyle}>
        ขอบคุณสำหรับการชำระเงิน ออเดอร์ {orderNumber} ได้รับการยืนยันแล้ว
        ทีมงานจะดำเนินการต่อตามลำดับ
      </Text>
    </BaseEmailLayout>
  );
}
