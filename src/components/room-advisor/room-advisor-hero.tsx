import { Sparkles } from "lucide-react";

export function RoomAdvisorHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#126B68] px-6 py-10 text-white sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.12) 10px, rgba(255,255,255,0.12) 20px)",
        }}
      />
      <div className="relative max-w-2xl space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/85">
          <Sparkles className="size-3.5" />
          Room Advisor
        </p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          AI ที่ปรึกษาห้อง
        </h1>
        <p className="text-sm leading-relaxed text-white/90 sm:text-base">
          อัปโหลดรูปห้อง — AI วิเคราะห์สไตล์และแนะนำม่านที่เหมาะ
          ดูตัวอย่างจากแกลเลอรี WP Inspiration แล้วปรับแต่งใน Custom ได้ทันที
        </p>
      </div>
    </section>
  );
}
