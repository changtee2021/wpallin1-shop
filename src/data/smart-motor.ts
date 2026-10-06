import { getCatalogProduct } from "@/data/products-catalog";
import type { Bi } from "@/lib/bi";

const t = (th: string, en: string): Bi => ({ th, en });

export type SmartMotorKind = "curtain" | "blind";

export type SmartMotorType = {
  id: string;
  kind: SmartMotorKind;
  /** English headline shown large; the Thai line sits under it. */
  title: string;
  description: Bi;
  /** Catalog product whose photo is borrowed until dedicated motor photos arrive. */
  imageFrom: string;
  /** Motor models that fit this type. Empty until the spec sheets arrive. */
  motorSlugs: string[];
};

export const SMART_MOTOR_TYPES: SmartMotorType[] = [
  {
    id: "roller",
    kind: "blind",
    title: "Roller blind motor",
    description: t(
      "มอเตอร์ม่านม้วน เปิด-ปิดจากรีโมท สวิตช์ หรือมือถือ",
      "Motorised roller blinds, run from a remote, wall switch or phone.",
    ),
    imageFrom: "roller-blinds",
    motorSlugs: [],
  },
  {
    id: "wood",
    kind: "blind",
    title: "Wood blind motor",
    description: t(
      "มอเตอร์มู่ลี่ไม้ ยกและปรับใบได้โดยไม่ต้องใช้มือ",
      "Motorised wooden blinds that lift and tilt hands-free.",
    ),
    imageFrom: "wood-blinds",
    motorSlugs: [],
  },
  {
    id: "aluminium",
    kind: "blind",
    title: "Aluminium blind motor",
    description: t(
      "มอเตอร์มู่ลี่อลูมิเนียม ปรับแสงได้ละเอียดด้วยปลายนิ้ว",
      "Motorised aluminium blinds with fine light control at your fingertips.",
    ),
    imageFrom: "aluminium-blinds",
    motorSlugs: [],
  },
  {
    id: "curtain-track",
    kind: "curtain",
    title: "Curtain Track Motor",
    description: t(
      "มอเตอร์รางม่าน ใช้ได้ทั้งม่านจีบและม่านลอน เงียบ เปิด-ปิดนุ่ม ซ่อนหลังรางได้",
      "Motorised curtain tracks for pleated and wave curtains, gliding quietly and hidden behind the track.",
    ),
    imageFrom: "s-curve-track",
    motorSlugs: ["wp-nano-power", "wp-n23"],
  },
];

export const SMART_MOTOR_CONTROLS: { id: string; title: string; body: Bi }[] = [
  {
    id: "remote",
    title: "Remote",
    body: t("รีโมท 1, 2 และ 6 ช่อง", "Remote with 1, 2 or 6 channels"),
  },
  {
    id: "switch",
    title: "Wall switch",
    body: t("สวิตช์ติดผนัง 1 และ 2 ช่อง", "Wall switch, 1 or 2 channels"),
  },
  {
    id: "phone",
    title: "Phone",
    body: t("ควบคุมผ่านมือถือ", "Mobile app control"),
  },
];

/** How it works — every line restates a fact already on the WP Nano Power / N23 spec sheets. */
export const SMART_MOTOR_FEATURES: { id: string; title: Bi; body: Bi }[] = [
  {
    id: "brushless",
    title: t("มอเตอร์ไร้แปรงถ่าน", "Brushless drive"),
    body: t(
      "แรงดึงเสถียร อายุการใช้งานยาว",
      "Steady pull and a long service life.",
    ),
  },
  {
    id: "quiet",
    title: t("เงียบ จนลืมว่ามีมอเตอร์", "So quiet you forget it's there"),
    body: t(
      "เสียงรบกวนต่ำสุด 20 dB เปิด-ปิดนุ่ม",
      "As low as 20 dB, gliding smoothly open and shut.",
    ),
  },
  {
    id: "memory",
    title: t("จำตำแหน่งหยุดอัตโนมัติ", "Automatic memory trip"),
    body: t(
      "มอเตอร์จดจำตำแหน่งหยุดให้เอง เปิดและปิดตรงจุดเดิมทุกครั้ง",
      "The motor remembers where to stop, so the curtain opens and closes to the same point.",
    ),
  },
  {
    id: "hidden",
    title: t("เล็กพอจะซ่อนหลังราง", "Small enough to hide"),
    body: t(
      "มอเตอร์ขนาด 47 × 65 × 80 มม. ซ่อนหลังรางได้สวย",
      "A 47 × 65 × 80 mm motor that tucks neatly behind the track.",
    ),
  },
  {
    id: "dual",
    title: t("ม่านสองชั้น พร้อมเสียบปลั๊ก", "Two layers, plug-in ready"),
    body: t(
      "WP N23 มีมอเตอร์หลักและมอเตอร์รองสำหรับม่านสองชั้น หัวปลั๊กพร้อมใช้งาน",
      "WP N23 pairs a main and a secondary motor for two-layer curtains, with a ready-to-use plug.",
    ),
  },
];

/** Photo for a motor type, taken from the matching catalog product. */
export function smartMotorImage(type: SmartMotorType): string | undefined {
  return getCatalogProduct(type.imageFrom)?.image;
}
