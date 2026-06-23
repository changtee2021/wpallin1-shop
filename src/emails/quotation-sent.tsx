import { Text } from "@react-email/components";

import { BaseEmailLayout, emailTextStyle } from "@/emails/base-layout";

type QuotationSentEmailProps = {
  quotationNumber: string;
  href: string;
};

export function QuotationSentEmail({
  quotationNumber,
  href,
}: QuotationSentEmailProps) {
  return (
    <BaseEmailLayout
      preview={`ใบเสนอราคา ${quotationNumber} รอการตอบรับ`}
      title="ใบเสนอราคาใหม่"
      ctaHref={href}
      ctaLabel="ดูใบเสนอราคา"
    >
      <Text style={emailTextStyle}>
        คุณได้รับใบเสนอราคา {quotationNumber}{" "}
        กรุณาตรวจสอบและตอบรับผ่านบัญชีของคุณ
      </Text>
    </BaseEmailLayout>
  );
}
