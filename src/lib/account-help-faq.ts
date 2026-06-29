import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Package,
  Phone,
  Receipt,
  ShoppingCart,
  Wallet,
} from "lucide-react";

type LocalizedText = { th: string; en: string };

export type HelpFlowStep = {
  emoji: string;
  step: number;
  title: LocalizedText;
  hint?: LocalizedText;
};

export type HelpMiniFaqItem = {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
};

export type HelpCta = {
  to: string;
  search?: Record<string, unknown>;
  label: LocalizedText;
};

export type HelpTopic = {
  id: string;
  icon: LucideIcon;
  accentClass: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  flow: HelpFlowStep[];
  simpleText: LocalizedText;
  tipBox?: LocalizedText;
  miniFaq: HelpMiniFaqItem[];
  ctas: HelpCta[];
};

export const ACCOUNT_HELP_TOPICS: HelpTopic[] = [
  {
    id: "order",
    icon: ShoppingCart,
    accentClass: "border-emerald-200 bg-emerald-50 text-emerald-900",
    title: { th: "วิธีสั่งซื้อสินค้า", en: "How to order" },
    subtitle: { th: "4 ขั้นตอนง่ายๆ", en: "4 easy steps" },
    flow: [
      {
        emoji: "🛍️",
        step: 1,
        title: { th: "เลือกสินค้า", en: "Pick products" },
        hint: { th: "จากร้านค้า", en: "From the shop" },
      },
      {
        emoji: "🛒",
        step: 2,
        title: { th: "ใส่ตะกร้า", en: "Add to cart" },
        hint: { th: "กดเพิ่มลงตะกร้า", en: "Tap add to cart" },
      },
      {
        emoji: "💳",
        step: 3,
        title: { th: "ไปจ่ายเงิน", en: "Go to checkout" },
        hint: { th: "ใส่ที่อยู่จัดส่ง", en: "Enter shipping address" },
      },
      {
        emoji: "📦",
        step: 4,
        title: { th: "รอรับของ", en: "Wait for delivery" },
        hint: { th: "ดูที่คำสั่งซื้อ", en: "Check your orders" },
      },
    ],
    simpleText: {
      th: "ดูสินค้าได้โดยไม่ต้องเข้าสู่ระบบ แต่การสั่งซื้อต้องเข้าสู่ระบบก่อน ไอคอนตะกร้าอยู่มุมขวาบน (มือถืออยู่แถบล่าง)",
      en: "You can browse without logging in, but you must sign in to place an order. The cart icon is at the top right (bottom bar on mobile).",
    },
    miniFaq: [
      {
        id: "order-login",
        question: { th: "ต้องสมัครก่อนไหม?", en: "Do I need an account?" },
        answer: {
          th: "ดูสินค้าได้เลย แต่ซื้อและขอใบเสนอราคาต้องเข้าสู่ระบบก่อน",
          en: "You can browse freely, but ordering and quotations require sign-in.",
        },
      },
      {
        id: "order-cart",
        question: { th: "ตะกร้าอยู่ไหน?", en: "Where is my cart?" },
        answer: {
          th: "กดไอคอนรถเข็นที่มุมขวาบน หรือแถบล่างบนมือถือ",
          en: "Tap the cart icon at the top right or on the bottom bar on mobile.",
        },
      },
    ],
    ctas: [
      { to: "/shop", label: { th: "ไปหน้าร้านค้า", en: "Go to shop" } },
      { to: "/cart", label: { th: "ไปตะกร้า", en: "Go to cart" } },
    ],
  },
  {
    id: "payment",
    icon: Banknote,
    accentClass: "border-sky-200 bg-sky-50 text-sky-900",
    title: { th: "วิธีจ่ายเงิน / โอนเงิน", en: "How to pay / bank transfer" },
    subtitle: {
      th: "โอนแล้วอย่าลืมส่งสลิป",
      en: "Upload your slip after transfer",
    },
    flow: [
      {
        emoji: "💸",
        step: 1,
        title: { th: "เลือกโอนเงิน", en: "Choose bank transfer" },
        hint: { th: "ตอนจ่ายเงิน", en: "At checkout" },
      },
      {
        emoji: "🏦",
        step: 2,
        title: { th: "โอนตามเลข", en: "Transfer money" },
        hint: { th: "ตามบัญชี/QR", en: "Use shown account/QR" },
      },
      {
        emoji: "📷",
        step: 3,
        title: { th: "ส่งสลิป", en: "Upload slip" },
        hint: { th: "ถ่ายรูปใบเสร็จ", en: "Photo of receipt" },
      },
      {
        emoji: "⏳",
        step: 4,
        title: { th: "รอตรวจ", en: "Wait for review" },
        hint: { th: "เจ้าหน้าที่ตรวจสอบ", en: "Team verifies payment" },
      },
    ],
    simpleText: {
      th: 'หลังโอนเงินแล้ว เปิดคำสั่งซื้อ → กดอัปโหลดสลิป สถานะจะเปลี่ยนเป็น "รอตรวจสลิป" เมื่อตรวจผ่านจะเป็น "ชำระแล้ว"',
      en: 'After transferring, open your order and upload the payment slip. Status becomes "Awaiting slip review", then "Paid" once approved.',
    },
    tipBox: {
      th: "ถ่ายสลิปให้เห็นยอดเงิน วันที่ และเวลาชัดๆ นะครับ/ค่ะ",
      en: "Make sure your slip photo clearly shows amount, date, and time.",
    },
    miniFaq: [
      {
        id: "payment-after",
        question: { th: "โอนแล้วต้องทำอะไร?", en: "What after I transfer?" },
        answer: {
          th: "กลับมาที่คำสั่งซื้อ แล้วกดอัปโหลดสลิปทันที",
          en: "Return to your order page and upload the slip right away.",
        },
      },
      {
        id: "payment-other",
        question: {
          th: "จ่ายด้วยเงินในระบบได้ไหม?",
          en: "Can I pay with wallet balance?",
        },
        answer: {
          th: 'ได้ ถ้ามียอด "ใช้ได้" พอ — เลือกกระเป๋าเงินตอนจ่ายเงิน',
          en: "Yes, if your available wallet balance is enough — select wallet at checkout.",
        },
      },
    ],
    ctas: [
      {
        to: "/account/orders",
        label: { th: "ไปคำสั่งซื้อ", en: "Go to orders" },
      },
    ],
  },
  {
    id: "tracking",
    icon: Package,
    accentClass: "border-orange-200 bg-orange-50 text-orange-900",
    title: { th: "ดูว่าของถึงไหนแล้ว", en: "Track your order" },
    subtitle: { th: "สถานะแต่ละแบบหมายความว่า", en: "What each status means" },
    flow: [
      {
        emoji: "🔴",
        step: 1,
        title: { th: "รอชำระ", en: "Awaiting payment" },
        hint: { th: "ยังไม่จ่าย", en: "Not paid yet" },
      },
      {
        emoji: "🟡",
        step: 2,
        title: { th: "รอตรวจสลิป", en: "Reviewing slip" },
        hint: { th: "ส่งสลิปแล้ว", en: "Slip uploaded" },
      },
      {
        emoji: "🔵",
        step: 3,
        title: { th: "กำลังเตรียม", en: "Preparing" },
        hint: { th: "จ่ายแล้ว", en: "Payment confirmed" },
      },
      {
        emoji: "🚚",
        step: 4,
        title: { th: "จัดส่งแล้ว", en: "Shipped" },
        hint: { th: "รอรับของ", en: "On the way" },
      },
      {
        emoji: "✅",
        step: 5,
        title: { th: "สำเร็จ", en: "Completed" },
        hint: { th: "รับของแล้ว", en: "Delivered" },
      },
    ],
    simpleText: {
      th: 'เปิดเมนู "คำสั่งซื้อ" จะเห็นรายการทั้งหมด กดแต่ละรายการเพื่อดูรายละเอียดและสถานะล่าสุด',
      en: 'Open "Orders" to see all purchases. Tap each order for details and the latest status.',
    },
    miniFaq: [
      {
        id: "tracking-slow",
        question: { th: "ของช้าไป?", en: "Why is it taking long?" },
        answer: {
          th: 'ถ้ายัง "รอตรวจสลิป" รอเจ้าหน้าที่ตรวจก่อน ถ้า "จัดส่งแล้ว" รอขนส่งนำส่ง',
          en: 'If status is "Reviewing slip", wait for verification. If "Shipped", wait for delivery.',
        },
      },
    ],
    ctas: [
      {
        to: "/account/orders",
        label: { th: "เปิดคำสั่งซื้อ", en: "Open orders" },
      },
    ],
  },
  {
    id: "tax-invoice",
    icon: Receipt,
    accentClass: "border-violet-200 bg-violet-50 text-violet-900",
    title: { th: "ใบกำกับภาษี", en: "Tax invoice" },
    subtitle: {
      th: "กรอกข้อมูลก่อน แล้วค่อยดาวน์โหลด",
      en: "Fill details first, then download",
    },
    flow: [
      {
        emoji: "🏢",
        step: 1,
        title: { th: "กรอกข้อมูล", en: "Enter tax info" },
        hint: { th: "เลขผู้เสียภาษี", en: "Tax ID number" },
      },
      {
        emoji: "💳",
        step: 2,
        title: { th: "สั่งและจ่าย", en: "Order & pay" },
        hint: { th: "ชำระให้ครบ", en: "Complete payment" },
      },
      {
        emoji: "📄",
        step: 3,
        title: { th: "ดาวน์โหลด", en: "Download" },
        hint: { th: "เมื่อใบออกแล้ว", en: "When invoice is ready" },
      },
    ],
    simpleText: {
      th: 'ไปที่ ตั้งค่า → ที่อยู่และภาษี กรอกชื่อ ที่อยู่ และเลขผู้เสียภาษีให้ครบ หลังชำระเงินแล้ว ดูใบกำกับได้ที่เมนู "ใบกำกับภาษี"',
      en: 'Go to Settings → Address & tax and fill in your name, address, and tax ID. After payment, download from "Tax invoice".',
    },
    tipBox: {
      th: "จ่ายแล้วแต่ยังไม่มีใบ อาจรอ 1–2 วันทำการ หรือติดต่อทีมงานพร้อมเลขออเดอร์",
      en: "If paid but no invoice yet, allow 1–2 business days or contact us with your order number.",
    },
    miniFaq: [
      {
        id: "tax-wrong",
        question: { th: "ใส่เลขผิด?", en: "Wrong tax ID?" },
        answer: {
          th: "แก้ที่ ตั้งค่า → ที่อยู่และภาษี ก่อนสั่งครั้งถัดไป",
          en: "Update under Settings → Address & tax before your next order.",
        },
      },
    ],
    ctas: [
      {
        to: "/account",
        search: { tab: "settings", section: "address-tax" },
        label: { th: "ไปตั้งค่าภาษี", en: "Tax settings" },
      },
      {
        to: "/account/tax-invoices",
        label: { th: "ไปใบกำกับภาษี", en: "Tax invoices" },
      },
    ],
  },
  {
    id: "wallet",
    icon: Wallet,
    accentClass: "border-amber-200 bg-amber-50 text-amber-900",
    title: { th: "เงินในระบบ / เติมเงิน", en: "Wallet / top up" },
    subtitle: {
      th: "ฝากเงินไว้ใช้จ่ายได้เลย",
      en: "Pre-load funds for quick checkout",
    },
    flow: [
      {
        emoji: "➕",
        step: 1,
        title: { th: "ขอเติมเงิน", en: "Request top-up" },
        hint: { th: "ระบุจำนวน", en: "Enter amount" },
      },
      {
        emoji: "🏦",
        step: 2,
        title: { th: "โอนเงิน", en: "Transfer" },
        hint: { th: "ตามที่ระบบแสดง", en: "As shown on screen" },
      },
      {
        emoji: "📷",
        step: 3,
        title: { th: "ส่งสลิป", en: "Upload slip" },
        hint: { th: "รออนุมัติ", en: "Wait for approval" },
      },
      {
        emoji: "💳",
        step: 4,
        title: { th: "ใช้จ่ายได้", en: "Ready to spend" },
        hint: { th: "ยอดใช้ได้", en: "Available balance" },
      },
    ],
    simpleText: {
      th: '"ยอดใช้ได้" คือเงินที่ใช้จ่ายออเดอร์ได้จริง "รอดำเนินการ" คือส่งสลิปเติมเงินแล้วแต่ยังรออนุมัติ — ยังใช้ไม่ได้',
      en: '"Available" balance can be used at checkout. "Pending" means your top-up slip is awaiting approval — not spendable yet.',
    },
    miniFaq: [
      {
        id: "wallet-cant",
        question: { th: "เติมแล้วใช้ไม่ได้?", en: "Top-up not working?" },
        answer: {
          th: "ตรวจว่ายังอยู่สถานะรอดำเนินการหรือไม่ ต้องรออนุมัติก่อนจึงจะเข้ายอดใช้ได้",
          en: "Check if it's still pending — funds move to available only after approval.",
        },
      },
    ],
    ctas: [
      {
        to: "/account",
        search: { tab: "settings", section: "finance" },
        label: { th: "ไปเติมเงิน", en: "Top up wallet" },
      },
    ],
  },
  {
    id: "contact",
    icon: Phone,
    accentClass: "border-rose-200 bg-rose-50 text-rose-900",
    title: { th: "ติดต่อช่วยเหลือ", en: "Get help" },
    subtitle: { th: "ทีมงานพร้อมช่วย", en: "Our team is here to help" },
    flow: [
      {
        emoji: "❓",
        step: 1,
        title: { th: "มีปัญหา", en: "Have a problem" },
        hint: { th: "จำเรื่องที่ติด", en: "Note what happened" },
      },
      {
        emoji: "📝",
        step: 2,
        title: { th: "เตรียมเลขออเดอร์", en: "Get order number" },
        hint: { th: "ถ้ามี", en: "If applicable" },
      },
      {
        emoji: "📩",
        step: 3,
        title: { th: "ส่งข้อความ", en: "Send message" },
        hint: { th: "หน้าติดต่อเรา", en: "Contact page" },
      },
      {
        emoji: "📞",
        step: 4,
        title: { th: "รอตอบกลับ", en: "Wait for reply" },
        hint: { th: "ทีมงานติดต่อ", en: "Team responds" },
      },
    ],
    simpleText: {
      th: 'กด "ติดต่อทีมงาน" ด้านล่าง บอกปัญหาสั้นๆ แนบเลขคำสั่งซื้อและรูปหน้าจอถ้ามี จะช่วยให้แก้เร็วขึ้น ไม่ต้องเข้าสู่ระบบก็ส่งได้',
      en: 'Tap "Contact us" below, describe the issue briefly, and include your order number and screenshots if possible. No sign-in required.',
    },
    miniFaq: [
      {
        id: "contact-login",
        question: { th: "ล็อกอินไม่ได้?", en: "Can't sign in?" },
        answer: {
          th: 'ใช้ "ลืมรหัสผ่าน" ที่หน้าเข้าสู่ระบบ หรือส่งข้อความหาทีมงาน',
          en: 'Use "Forgot password" on the login page, or contact us.',
        },
      },
      {
        id: "contact-upload",
        question: { th: "อัปโหลดไม่สำเร็จ?", en: "Upload failed?" },
        answer: {
          th: "ลองไฟล์เล็กลง เป็นรูป JPG/PNG ที่อ่านชัด หรือเปลี่ยนเบราว์เซอร์",
          en: "Try a smaller JPG/PNG file with clear text, or switch browsers.",
        },
      },
    ],
    ctas: [
      { to: "/contact", label: { th: "ส่งข้อความหาทีมงาน", en: "Contact us" } },
    ],
  },
];

export function pickLocalized(
  locale: "th" | "en",
  text: LocalizedText,
): string {
  return locale === "en" ? text.en : text.th;
}
