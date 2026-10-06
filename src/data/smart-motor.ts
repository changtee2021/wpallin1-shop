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
    id: "pleated",
    kind: "curtain",
    title: "Pleated curtain motor",
    description: t(
      "มอเตอร์ผ้าม่านจีบ เงียบ เปิด-ปิดนุ่ม ซ่อนหลังรางได้",
      "Motorised pleated curtains that glide quietly, hidden behind the track.",
    ),
    imageFrom: "standard-track",
    motorSlugs: ["wp-nano-power", "wp-n23"],
  },
  {
    id: "wave",
    kind: "curtain",
    title: "Wave curtain motor",
    description: t(
      "มอเตอร์ม่านลอน ลอนเรียบเท่ากันตลอดแนวทุกครั้งที่เปิดปิด",
      "Motorised wave curtains that keep an even fold every time.",
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

/** Photo for a motor type, taken from the matching catalog product. */
export function smartMotorImage(type: SmartMotorType): string | undefined {
  return getCatalogProduct(type.imageFrom)?.image;
}
