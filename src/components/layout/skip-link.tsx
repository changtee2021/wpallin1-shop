import { useBi } from "@/lib/bi";

export function SkipLink() {
  const pick = useBi();

  return (
    <a href="#main-content" className="skip-link">
      {pick({ th: "ข้ามไปเนื้อหาหลัก", en: "Skip to main content" })}
    </a>
  );
}
