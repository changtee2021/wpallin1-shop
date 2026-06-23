import type { Locale } from "@/i18n/types";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalPageContent = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const PLACEHOLDERS = {
  company: "[[COMPANY_NAME]]",
  address: "[[ADDRESS]]",
  dpo: "[[DPO_EMAIL]]",
  site: "https://wpallin1-shop.vercel.app",
};

export const legalPages: Record<
  "terms" | "privacy" | "cookies",
  Record<Locale, LegalPageContent>
> = {
  terms: {
    th: {
      title: "เงื่อนไขการใช้บริการ",
      lastUpdated: "23 มิถุนายน 2569",
      sections: [
        {
          title: "1. บทนำ",
          paragraphs: [
            `เว็บไซต์นี้ให้บริการโดย ${PLACEHOLDERS.company} ("เรา") การเข้าใช้งานหรือสั่งซื้อผ่าน ${PLACEHOLDERS.site} ถือว่าคุณยอมรับเงื่อนไขเหล่านี้`,
          ],
        },
        {
          title: "2. การสั่งซื้อและชำระเงิน",
          paragraphs: [
            "ราคาที่แสดงเป็นราคาโดยประมาณจนกว่าจะยืนยันคำสั่งซื้อ เราอาจปฏิเสธหรือยกเลิกคำสั่งซื้อหากสินค้าหมด ราคาผิดพลาด หรือมีเหตุสงสัยการทุจริต",
            "การชำระเงินผ่านโอนธนาคาร/PromptPay/กระเป๋าเงินในระบบ ต้องแนบหลักฐานการชำระตามที่ระบบกำหนด คำสั่งซื้อจะดำเนินการหลังยืนยันการชำระ",
          ],
        },
        {
          title: "3. การจัดส่งและการคืนสินค้า",
          paragraphs: [
            "สินค้าสั่งทำพิเศษอาจมีระยะเวลาผลิตและจัดส่งต่างจากสินค้าพร้อมส่ง รายละเอียดจะแจ้งในหน้าสินค้าหรือใบเสนอราคา",
            "การคืนหรือเปลี่ยนสินค้าสำหรับสินค้าสั่งทำพิเศษ เป็นไปตามนโยบายที่แจ้งในหน้าสินค้าและกฎหมายคุ้มครองผู้บริโภค",
          ],
        },
        {
          title: "4. บัญชีผู้ใช้",
          paragraphs: [
            "คุณต้องรักษาความลับของรหัสผ่านและข้อมูลบัญชี เราไม่รับผิดชอบต่อความเสียหายจากการเข้าถึงบัญชีโดยไม่ได้รับอนุญาต",
          ],
        },
        {
          title: "5. ทรัพย์สินทางปัญญา",
          paragraphs: [
            "เนื้อหา รูปภาพ โลโก้ และซอฟตware บนเว็บไซต์เป็นทรัพย์สินของเราหรือผู้ให้อนุญาต ห้ามคัดลอกหรือใช้เพื่อการค้าโดยไม่ได้รับอนุญาต",
          ],
        },
        {
          title: "6. ข้อจำกัดความรับผิด",
          paragraphs: [
            "เราไม่รับผิดชอบต่อความเสียหายทางอ้อม หรือความล่าช้าที่เกิดจากเหตุสุดวิสัย ภายในขอบเขตที่กฎหมายอนุญาต",
          ],
        },
        {
          title: "7. ติดต่อ",
          paragraphs: [
            `${PLACEHOLDERS.company}, ${PLACEHOLDERS.address}`,
            `อีเมล: ${PLACEHOLDERS.dpo}`,
          ],
        },
      ],
    },
    en: {
      title: "Terms of Service",
      lastUpdated: "23 June 2026",
      sections: [
        {
          title: "1. Introduction",
          paragraphs: [
            `This website is operated by ${PLACEHOLDERS.company} ("we"). By using or purchasing through ${PLACEHOLDERS.site}, you agree to these terms.`,
          ],
        },
        {
          title: "2. Orders and payment",
          paragraphs: [
            "Displayed prices are indicative until an order is confirmed. We may refuse or cancel orders due to stock, pricing errors, or suspected fraud.",
            "Bank transfer, PromptPay, and in-app wallet payments require proof of payment as specified. Orders proceed after payment confirmation.",
          ],
        },
        {
          title: "3. Delivery and returns",
          paragraphs: [
            "Made-to-order items may have different lead times than ready stock. Details are shown on product pages or quotations.",
            "Returns or exchanges for custom-made goods follow the policy stated on the product page and applicable consumer protection laws.",
          ],
        },
        {
          title: "4. User accounts",
          paragraphs: [
            "You must keep your password and account details confidential. We are not liable for unauthorized account access.",
          ],
        },
        {
          title: "5. Intellectual property",
          paragraphs: [
            "Site content, images, logos, and software belong to us or our licensors. Commercial use without permission is prohibited.",
          ],
        },
        {
          title: "6. Limitation of liability",
          paragraphs: [
            "We are not liable for indirect damages or delays caused by force majeure, to the extent permitted by law.",
          ],
        },
        {
          title: "7. Contact",
          paragraphs: [
            `${PLACEHOLDERS.company}, ${PLACEHOLDERS.address}`,
            `Email: ${PLACEHOLDERS.dpo}`,
          ],
        },
      ],
    },
  },
  privacy: {
    th: {
      title: "นโยบายความเป็นส่วนตัว (PDPA)",
      lastUpdated: "23 มิถุนายน 2569",
      sections: [
        {
          title: "1. ผู้ควบคุมข้อมูล",
          paragraphs: [
            `${PLACEHOLDERS.company} ที่อยู่ ${PLACEHOLDERS.address}`,
            `เจ้าหน้าที่คุ้มครองข้อมูล (DPO): ${PLACEHOLDERS.dpo}`,
          ],
        },
        {
          title: "2. ข้อมูลที่เราเก็บ",
          paragraphs: [
            "ข้อมูลบัญชี: ชื่อ อีเมล รหัสผู้ใช้",
            "ข้อมูลคำสั่งซื้อ: ที่อยู่จัดส่ง เบอร์โทร ประวัติการสั่งซื้อ หลักฐานการชำระเงิน",
            "ข้อมูลการใช้งาน: คุกกie/Local Storage ที่จำเป็น (เช่น ตะกร้า ภาษา การเข้าสู่ระบบ)",
          ],
        },
        {
          title: "3. วัตถุประสงค์และฐานทางกฎหมาย",
          paragraphs: [
            "ประมวลผลคำสั่งซื้อ จัดส่ง บริการหลังการขาย — สัญญา/การปฏิบัติตามสัญญา",
            "การตลาดและโปรโมชัน — ความยินยอม (สามารถถอนได้)",
            "ปฏิบัติตามกฎหมายและป้องกันการทุจริต — ประโยชน์โดยชอบด้วยกฎหมาย/หน้าที่ตามกฎหมาย",
          ],
        },
        {
          title: "4. การเปิดเผยข้อมูล",
          paragraphs: [
            "เราอาจเปิดเผยข้อมูลให้ผู้ให้บริการ: Supabase (ฐานข้อมูล), Vercel (โฮสต์), Resend (อีเมล), ขนส่ง — เฉพาะเท่าที่จำเป็น",
          ],
        },
        {
          title: "5. ระยะเวลาเก็บข้อมูล",
          paragraphs: [
            "เก็บตามระยะเวลาที่จำเป็นต่อวัตถุประสงค์และข้อกำหนดทางบัญชี/ภาษี จากนั้นจะลบหรือทำให้ไม่ระบุตัวตน",
          ],
        },
        {
          title: "6. สิทธิของเจ้าของข้อมูล",
          paragraphs: [
            "คุณมีสิทธิขอเข้าถึง แก้ไข ลบ จำกัด คัดค้าน โอนข้อมูล และถอนความยินยอม โดยติดต่อ DPO ที่อีเมลด้านบน",
          ],
        },
        {
          title: "7. ความปลอดภัย",
          paragraphs: [
            "เราใช้มาตรการทางเทคนิคและองค์กรที่เหมาะสม รวมถึง HTTPS, การควบคุมสิทธิ์ (RLS), และการจำกัดการเข้าถึงข้อมูล",
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy (PDPA)",
      lastUpdated: "23 June 2026",
      sections: [
        {
          title: "1. Data controller",
          paragraphs: [
            `${PLACEHOLDERS.company}, ${PLACEHOLDERS.address}`,
            `Data Protection Officer (DPO): ${PLACEHOLDERS.dpo}`,
          ],
        },
        {
          title: "2. Data we collect",
          paragraphs: [
            "Account data: name, email, user ID",
            "Order data: shipping address, phone, order history, payment slips",
            "Usage data: essential cookies/local storage (cart, locale, auth session)",
          ],
        },
        {
          title: "3. Purposes and legal bases",
          paragraphs: [
            "Order processing, delivery, after-sales — contract/performance of contract",
            "Marketing and promotions — consent (withdrawable)",
            "Legal compliance and fraud prevention — legitimate interest/legal obligation",
          ],
        },
        {
          title: "4. Disclosure",
          paragraphs: [
            "We may share data with: Supabase (database), Vercel (hosting), Resend (email), carriers — only as necessary.",
          ],
        },
        {
          title: "5. Retention",
          paragraphs: [
            "We retain data as long as needed for the stated purposes and accounting/tax requirements, then delete or anonymize.",
          ],
        },
        {
          title: "6. Your rights",
          paragraphs: [
            "You may request access, correction, deletion, restriction, objection, portability, and withdraw consent by contacting the DPO above.",
          ],
        },
        {
          title: "7. Security",
          paragraphs: [
            "We apply appropriate technical and organizational measures including HTTPS, access controls (RLS), and limited data access.",
          ],
        },
      ],
    },
  },
  cookies: {
    th: {
      title: "นโยบายคุกกี้",
      lastUpdated: "23 มิถุนายน 2569",
      sections: [
        {
          title: "1. คุกกี้คืออะไร",
          paragraphs: [
            "คุกกี้และ Local Storage ช่วยให้เว็บไซต์จดจำการตั้งค่าและให้บริการพื้นฐาน",
          ],
        },
        {
          title: "2. คุกกี้ที่จำเป็น (ไม่ต้องขอความยินยอม)",
          paragraphs: [
            "Supabase auth session — เข้าสู่ระบบและรักษา session",
            "Cart session — เก็บตะกร้าสินค้า",
          ],
        },
        {
          title: "3. คุกกี้/Storage เพื่อการทำงาน",
          paragraphs: [
            "locale preference — ภาษา th/en",
            "recently-viewed — สินค้าที่ดูล่าสุด (Local Storage)",
            "cookie-consent — บันทึกการเลือกความยินยอมของคุณ",
          ],
        },
        {
          title: "4. คุกกี้การตลาด (ต้องขอความยินยอม)",
          paragraphs: [
            'Analytics หรือ advertising pixels จะโหลดเฉพาะเมื่อคุณเลือก "ยอมรับทั้งหมด" ในแบนเนอร์คุกกี้',
          ],
        },
        {
          title: "5. การจัดการคุกกี้",
          paragraphs: [
            "คุณสามารถเปลี่ยนการตั้งค่าได้จากแบนเนอร์คุกกี้ หรือลบข้อมูลในเบราว์เซอร์ การปิดคุกกี้ที่จำเป็นอาจทำให้บางฟีเจอร์ใช้งานไม่ได้",
          ],
        },
      ],
    },
    en: {
      title: "Cookie Policy",
      lastUpdated: "23 June 2026",
      sections: [
        {
          title: "1. What are cookies",
          paragraphs: [
            "Cookies and local storage help the site remember settings and provide core functionality.",
          ],
        },
        {
          title: "2. Strictly necessary (no consent required)",
          paragraphs: [
            "Supabase auth session — login and session persistence",
            "Cart session — shopping cart state",
          ],
        },
        {
          title: "3. Functional storage",
          paragraphs: [
            "Locale preference — th/en language",
            "Recently viewed products — local storage",
            "cookie-consent — stores your consent choice",
          ],
        },
        {
          title: "4. Marketing cookies (consent required)",
          paragraphs: [
            'Analytics or advertising pixels load only when you choose "Accept all" in the cookie banner.',
          ],
        },
        {
          title: "5. Managing cookies",
          paragraphs: [
            "You can change preferences via the cookie banner or clear browser data. Disabling essential cookies may break some features.",
          ],
        },
      ],
    },
  },
};

export function getLegalPage(
  page: keyof typeof legalPages,
  locale: Locale,
): LegalPageContent {
  return legalPages[page][locale] ?? legalPages[page].th;
}
