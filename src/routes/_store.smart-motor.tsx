import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { ContactCtaBand } from "@/components/brand/contact-cta";
import { SectionHeading } from "@/components/brand/section-heading";
import { getCatalogProduct } from "@/data/products-catalog";
import {
  SMART_MOTOR_CONTROLS,
  SMART_MOTOR_TYPES,
  smartMotorImage,
  type SmartMotorKind,
  type SmartMotorType,
} from "@/data/smart-motor";
import { useBi } from "@/lib/bi";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_store/smart-motor")({
  head: () =>
    pageHead({
      title: "Smart Motor | WP ALL",
      description:
        "ระบบมอเตอร์อัจฉริยะสำหรับม่านม้วน มู่ลี่ไม้ มู่ลี่อลูมิเนียม ผ้าม่านจีบ และม่านลอน ควบคุมผ่านรีโมท สวิตช์ติดผนัง และมือถือ",
      path: "/smart-motor",
      image: "/products/motorized-track.webp",
    }),
  component: SmartMotorPage,
});

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const GROUPS: { kind: SmartMotorKind; kicker: string; title: string }[] = [
  { kind: "blind", kicker: "Blinds", title: "Motors for blinds" },
  { kind: "curtain", kicker: "Curtains", title: "Motors for curtains" },
];

function MotorTypeCard({ type }: { type: SmartMotorType }) {
  const pick = useBi();
  const image = smartMotorImage(type);
  const motors = type.motorSlugs
    .map((slug) => getCatalogProduct(slug))
    .filter((product) => product !== undefined);

  return (
    <li className="scroll-rise flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface">
        {image ? (
          <img
            src={image}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <h3 className="mt-5 text-xl font-medium tracking-tight text-foreground lg:text-2xl">
        {type.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {pick(type.description)}
      </p>

      <div className="mt-4 border-t border-border pt-4">
        {motors.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {motors.map((product) => (
              <li key={product.slug}>
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  className="group flex min-h-11 items-center justify-between gap-3 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  {pick(product.name)}
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="brand-kicker text-muted-foreground">
            {pick({
              th: "ข้อมูลรุ่นและสเปกเร็วๆ นี้",
              en: "Models and specs coming soon",
            })}
          </p>
        )}
      </div>
    </li>
  );
}

function SmartMotorPage() {
  const pick = useBi();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary-deep text-white">
        <img
          src="/products/motorized-track.webp"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 -z-10 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.7),rgb(0_0_0/0.25)_60%,rgb(0_0_0/0.35))]" />
        <div
          className={`${container} flex min-h-[26rem] flex-col justify-end py-14 lg:min-h-[34rem] lg:py-20`}
        >
          <p className="hero-blur-in brand-kicker flex items-center gap-3 text-white/75">
            <span aria-hidden className="h-px w-8 bg-accent" />
            Every curtain · Every blind
          </p>
          <h1
            className="hero-blur-in mt-5 text-5xl leading-[1.1] font-medium tracking-tight sm:text-6xl lg:text-7xl"
            style={{ ["--delay" as string]: "150ms" }}
          >
            Smart Motor
          </h1>
          <p
            className="hero-blur-in mt-5 max-w-xl text-base leading-7 text-white/80 text-pretty sm:text-lg sm:leading-8"
            style={{ ["--delay" as string]: "350ms" }}
          >
            {pick({
              th: "ม่านและมู่ลี่ทุกแบบ ติดมอเตอร์ได้ เปิด-ปิดจากรีโมท สวิตช์ หรือมือถือ",
              en: "Motors for every curtain and blind, run from a remote, a wall switch or your phone.",
            })}
          </p>
        </div>
      </section>

      <section className="brand-section bg-background">
        <div className={container}>
          <SectionHeading
            index="01"
            kicker="Control"
            title={pick({
              th: "สั่งงานได้ 3 วิธี",
              en: "Three ways to control",
            })}
          />
          <ul className="mt-12 grid divide-y divide-border border-t border-border md:grid-cols-3 md:divide-x md:divide-y-0">
            {SMART_MOTOR_CONTROLS.map((control, index) => (
              <li
                key={control.id}
                className="scroll-rise flex items-start gap-4 py-7 md:px-6 md:first:pl-0 md:last:pr-0"
                style={{ ["--i" as string]: index }}
              >
                <span className="text-4xl leading-none font-medium tracking-tight text-accent lg:text-5xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-base font-medium tracking-tight text-foreground lg:text-lg">
                    {control.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {pick(control.body)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {GROUPS.map((group, groupIndex) => (
        <section
          key={group.kind}
          className={
            groupIndex % 2 === 0
              ? "brand-section bg-cream"
              : "brand-section bg-background"
          }
        >
          <div className={container}>
            <SectionHeading
              index={String(groupIndex + 2).padStart(2, "0")}
              kicker={group.kicker}
              title={group.title}
            />
            <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {SMART_MOTOR_TYPES.filter((type) => type.kind === group.kind).map(
                (type) => (
                  <MotorTypeCard key={type.id} type={type} />
                ),
              )}
            </ul>
          </div>
        </section>
      ))}

      <ContactCtaBand
        kicker="Smart Motor"
        title={{
          th: "อยากได้ม่านหรือมู่ลี่แบบติดมอเตอร์?",
          en: "Want motorised curtains or blinds?",
        }}
        description={{
          th: "บอกประเภทและขนาดหน้างาน ทีมงานช่วยเลือกระบบที่เหมาะให้ คุยกับเราได้ทาง LINE",
          en: "Tell us the type and size. Our team will help you choose the right system. Reach us on LINE.",
        }}
      />
    </>
  );
}
