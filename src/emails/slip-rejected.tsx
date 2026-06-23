import { Text } from "@react-email/components";

import { BaseEmailLayout, emailTextStyle } from "@/emails/base-layout";

type SlipRejectedEmailProps = {
  orderNumber: string;
  href: string;
};

export function SlipRejectedEmail({
  orderNumber,
  href,
}: SlipRejectedEmailProps) {
  return (
    <BaseEmailLayout
      preview={`กรุณาอัปโหลดสลิปใหม่สำหรับออเดอร์ ${orderNumber}`}
      title="สลิปไม่ผ่านการตรวจสอบ"
      ctaHref={href}
      ctaLabel="อัปโหลดสลิปใหม่"
    >
      <Text style={emailTextStyle}>
        สลิปการชำระเงินสำหรับออเดอร์ {orderNumber} ไม่ผ่านการตรวจสอบ
        กรุณาอัปโหลดสลิปใหม่ที่ถูกต้อง
      </Text>
    </BaseEmailLayout>
  );
}
