import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import { CountUpNumber } from "@/components/storefront/home/count-up-number";
import { useBi, type Bi } from "@/lib/bi";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const STATEMENT: Bi = {
  th: "ทุกหน้าต่างไม่เหมือนกัน WP ALL จึงใส่ใจทุกรายละเอียด ตั้งแต่เลือกวัสดุ ขึ้นรูป จนถึงตรวจงาน ให้พอดีกับพื้นที่ของคุณ",
  en: "No two windows are alike. So WP ALL takes care of every detail — from material to making to the final check — until it fits your space.",
};

const USP_ITEMS: { title: Bi; text: Bi }[] = [
  {
    title: { th: "งานประณีตทุกชิ้น", en: "Crafted with care" },
    text: {
      th: "คัดวัสดุ ขึ้นรูป และตรวจคุณภาพด้วยทีมของเราเอง",
      en: "Materials, making and checks handled by our own team",
    },
  },
  {
    title: { th: "สั่งทำตามขนาดจริง", en: "Made to order" },
    text: {
      th: "ผลิตตามขนาดหน้างาน ไม่ต้องปรับหน้าต่างให้เข้ากับสินค้า",
      en: "Built to your measurements, not the other way round",
    },
  },
  {
    title: { th: "Dealer / OEM / ODM", en: "Dealer / OEM / ODM" },
    text: {
      th: "ผลิตให้ร้านม่านและแบรนด์ทั่วประเทศ",
      en: "Manufacturing partner for curtain shops and brands",
    },
  },
  {
    title: { th: "ระบบมอเตอร์อัจฉริยะ", en: "Smart motor" },
    text: {
      th: "รางมอเตอร์เงียบ ควบคุมผ่านรีโมทและมือถือ",
      en: "Quiet motors with remote and mobile control",
    },
  },
];

/** Chapter 1 — the promise. Words light up one by one as the sentence scrolls into view. */
export function BrandStatement() {
  const pick = useBi();
  const words = pick(STATEMENT).split(" ");

  return (
    <section className="brand-section bg-background">
      <div className={container}>
        <p className="max-w-5xl text-3xl leading-[1.4] font-medium tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.35]">
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="scroll-word inline-block"
              style={{ ["--i" as string]: index }}
            >
              {word}
              {"\u00a0"}
            </span>
          ))}
        </p>

        <ul className="mt-16 grid divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {USP_ITEMS.map((item, index) => (
            <li
              key={item.title.en}
              className="scroll-rise flex items-start gap-4 py-7 sm:px-2 lg:px-6 lg:first:pl-0 lg:last:pr-0"
              style={{ ["--i" as string]: index }}
            >
              <span className="text-4xl leading-none font-medium tracking-tight text-accent lg:text-5xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-base font-medium tracking-tight text-foreground lg:text-lg">
                  {item.title.en}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {pick(item.text)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * The home page tells the production story in four broad steps. The detailed six-step
 * line (prep, cut, drill, assemble, colour storage, QC) stays on the About page.
 */
const HOME_STEPS: { title: Bi; body: Bi; photo: string }[] = [
  {
    title: { th: "เตรียม", en: "Prepare" },
    body: {
      th: "ตรวจรับและเตรียมวัสดุตามใบสั่งผลิต จัดเก็บแยกตามรหัสสี หยิบใช้ได้ถูกต้อง",
      en: "Materials checked and staged against each work order, stored by colour code.",
    },
    photo: "/brand/process-prep.webp",
  },
  {
    title: { th: "ประกอบ", en: "Assemble" },
    body: {
      th: "ตัด เจาะ และประกอบชุดกลไกกับตัวสินค้าในสายผลิตของเราเอง",
      en: "Cut, drilled and assembled on our own line, mechanisms and all.",
    },
    photo: "/brand/process-assemble.webp",
  },
  {
    title: { th: "ตรวจ", en: "Inspect" },
    body: {
      th: "ตรวจการทำงานและความเรียบร้อยก่อนแพ็กส่ง",
      en: "Function and finish checked before packing.",
    },
    photo: "/brand/process-qc.webp",
  },
  {
    title: { th: "ส่งมอบ", en: "Deliver" },
    body: {
      th: "แพ็กและส่งมอบถึงมือร้านค้าและลูกค้า",
      en: "Packed and handed over to shops and customers.",
    },
    photo: "/about/ready-stock-containers.webp",
  },
];

/** Chapter 5 — the factory, after the projects. One screen: photo + four steps that expand on tap or hover. */
export function BrandFactory() {
  const pick = useBi();
  const [active, setActive] = useState(0);

  const stats: { title: string; detail: Bi }[] = [
    {
      title: "1,000+ SKUs",
      detail: {
        th: "รองรับม่านได้ทุกรูปแบบ",
        en: "Every style of curtain, in one range",
      },
    },
    {
      title: "Made to order",
      detail: {
        th: "สั่งทำตามความต้องการ",
        en: "Made to your requirements",
      },
    },
    {
      title: "Smart motor",
      detail: {
        th: "เลือกติดตั้งได้ทั้งม่านและมู่ลี่",
        en: "Available for curtains and blinds",
      },
    },
    {
      title: "Homes & projects",
      detail: {
        th: "ครอบคลุมทั้งบ้านและงานโครงการ",
        en: "For homes and commercial projects",
      },
    },
  ];

  return (
    <section className="brand-section relative isolate bg-primary-deep text-white">
      <div className={container}>
        <SectionHeading
          hideKicker
          tone="dark"
          index="05"
          kicker="Craftsmanship"
          title="Step of CREATION"
          description={pick({
            th: "ขั้นตอนความใส่ใจของเรา",
            en: "",
          })}
        />

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-stretch lg:gap-14">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black/20 lg:aspect-auto lg:min-h-[28rem]">
            {HOME_STEPS.map(({ photo: src }, photo) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden
                loading="lazy"
                className={cn(
                  "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-out",
                  active === photo
                    ? "scale-100 opacity-100"
                    : "scale-[1.05] opacity-0",
                )}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
              <p className="text-lg font-medium text-white lg:text-xl">
                {pick(HOME_STEPS[active].title)}
              </p>
            </div>
          </div>

          <ol className="flex flex-col lg:justify-center">
            {HOME_STEPS.map((step, index) => {
              const open = active === index;
              return (
                <li
                  key={step.title.en}
                  className="border-t border-white/15 last:border-b"
                  onMouseEnter={() => setActive(index)}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    className="flex min-h-14 w-full items-center gap-5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span
                      className={cn(
                        "brand-index w-6 shrink-0 transition-colors",
                        open ? "text-accent" : "text-white/40",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-lg font-medium tracking-tight transition-colors lg:text-xl",
                        open ? "text-white" : "text-white/55",
                      )}
                    >
                      {pick(step.title)}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "h-px bg-accent transition-[width] duration-500",
                        open ? "w-8" : "w-0",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-500 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <p className="overflow-hidden pl-11 text-sm leading-6 text-white/70">
                      <span className="block pb-4">{pick(step.body)}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-12 flex flex-col gap-8 border-t border-white/15 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.title}>
                <dd className="text-xl font-medium tracking-tight text-balance text-white sm:text-2xl">
                  <CountUpNumber value={stat.title} />
                </dd>
                <dt className="mt-1 text-sm leading-5 text-white/60">
                  {pick(stat.detail)}
                </dt>
              </div>
            ))}
          </dl>
          <Link
            to="/about"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-white"
          >
            {pick({ th: "รู้จัก WP ALL", en: "Meet WP ALL" })}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
