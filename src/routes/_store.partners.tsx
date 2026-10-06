import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Factory, MessageCircle } from "lucide-react";

import { ProjectCard } from "@/components/brand/project-card";
import { SectionHeading } from "@/components/brand/section-heading";
import { BusinessContactForm } from "@/components/storefront/business-contact-form";
import { RevealOnScroll } from "@/components/storefront/reveal-on-scroll";
import { PRODUCT_CATEGORIES } from "@/data/products-catalog";
import { PROJECTS } from "@/data/projects";
import { useBi, type Bi } from "@/lib/bi";
import { pageHead } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/_store/partners")({
  head: () =>
    pageHead({
      title: "ตัวแทนจำหน่าย / OEM / ODM | WP ALL",
      description:
        "ร่วมเป็นตัวแทนจำหน่ายม่าน มู่ลี่ ราง และมอเตอร์ WP ALL หรือสั่งผลิตแบบ OEM / ODM ภายใต้แบรนด์ของคุณ ผลิตตามออเดอร์และจัดส่งถึงร้านคุณ",
      path: "/partners",
      image: "/brand/factory-2.webp",
    }),
  component: PartnersPage,
});

const MODELS: { code: string; title: Bi; body: Bi; points: Bi[] }[] = [
  {
    code: "Dealer",
    title: { th: "ตัวแทนจำหน่าย", en: "Dealer" },
    body: {
      th: "สำหรับร้านผ้าม่าน ช่างติดตั้ง และผู้รับเหมาตกแต่ง สั่งสินค้าตามขนาดหน้างาน เราผลิตและจัดส่งให้",
      en: "For curtain shops, installers and fit-out contractors. Order to site sizes — we make and ship.",
    },
    points: [
      { th: "ราคาสำหรับตัวแทนจำหน่าย", en: "Dealer pricing" },
      {
        th: "ผลิตตามขนาดสั่ง (Made to Order)",
        en: "Made to order, to your sizes",
      },
      { th: "ทีมขายดูแลผ่าน LINE", en: "Sales support over LINE" },
    ],
  },
  {
    code: "OEM",
    title: {
      th: "ผลิตภายใต้แบรนด์คุณ",
      en: "Original Equipment Manufacturing",
    },
    body: {
      th: "ใช้แบบและมาตรฐานของเรา ผลิตภายใต้ชื่อแบรนด์ของคุณ เหมาะกับร้านค้าปลีกและแบรนด์ที่ต้องการขยายไลน์สินค้า",
      en: "Our designs and standards, made under your brand — for retailers and brands extending their range.",
    },
    points: [
      {
        th: "ติดแบรนด์บนสินค้าและบรรจุภัณฑ์",
        en: "Your brand on product and packaging",
      },
      {
        th: "เลือกรุ่น สี และสเปกจากไลน์ผลิตเดิม",
        en: "Pick models, colours and specs from our lines",
      },
      { th: "วางแผนการผลิตร่วมกัน", en: "Production planned with you" },
    ],
  },
  {
    code: "ODM",
    title: { th: "ออกแบบและผลิตใหม่", en: "Original Design Manufacturing" },
    body: {
      th: "พัฒนาสินค้าใหม่ร่วมกันตั้งแต่โจทย์ สเปก ไปจนถึงตัวอย่างและการผลิตจริง",
      en: "New products developed together — from brief and spec to samples and full production.",
    },
    points: [
      { th: "พัฒนาสเปกตามโจทย์งาน", en: "Specs developed to your brief" },
      { th: "ทำตัวอย่างก่อนผลิตจริง", en: "Samples before full production" },
      { th: "พิมพ์ลายเฉพาะได้", en: "Custom printing available" },
    ],
  },
];

const STEPS: { title: Bi; body: Bi }[] = [
  {
    title: { th: "ส่งข้อมูลร้าน", en: "Tell us about your business" },
    body: {
      th: "กรอกฟอร์มด้านล่างหรือทัก LINE บอกประเภทธุรกิจและพื้นที่ขาย",
      en: "Fill in the form below or message us on LINE with your business type and area.",
    },
  },
  {
    title: { th: "คุยกับทีมขาย", en: "Talk to sales" },
    body: {
      th: "ทีมขายติดต่อกลับ แนะนำสินค้า เงื่อนไข และส่งแคตตาล็อก",
      en: "Our sales team calls back with products, terms and catalogues.",
    },
  },
  {
    title: { th: "ดูตัวอย่างหรือนัดเยี่ยมชม", en: "See samples or visit" },
    body: {
      th: "ขอตัวอย่างสีและวัสดุ หรือนัดดูสายผลิตที่คลองสามวา",
      en: "Request colour and material samples, or book a tour of our Khlong Sam Wa lines.",
    },
  },
  {
    title: { th: "เริ่มสั่งผลิต", en: "Place your first order" },
    body: {
      th: "ส่งขนาดหน้างาน เราผลิตตามออเดอร์และจัดส่งถึงคุณ",
      en: "Send site sizes — we make to order and deliver.",
    },
  },
];

function PartnersPage() {
  const pick = useBi();
  const dealerProjects = PROJECTS.filter(
    (project) => project.kind === "dealer",
  );

  return (
    <>
      <section className="relative overflow-hidden bg-primary-deep text-white">
        <img
          src="/brand/factory-2.webp"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deep/85 to-primary-deep/30"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <SectionHeading
            as="h1"
            tone="dark"
            kicker="Partners"
            title="Dealer / OEM / ODM"
            description={pick({
              th: "ด้วยศักยภาพการผลิตแบบ Made to Order เราผลิตม่าน มู่ลี่ ราง และมอเตอร์ให้ร้านตัวแทน แบรนด์ และงานโครงการทั่วประเทศ",
              en: "With made-to-order production, we supply curtains, blinds, tracks and motors to dealers, brands and projects across Thailand.",
            })}
          />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#partner-form"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent/90"
            >
              {pick({ th: "สมัครเป็นพันธมิตร", en: "Become a partner" })}
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white hover:bg-white/10"
            >
              <MessageCircle className="size-4" aria-hidden />
              LINE {siteConfig.lineId}
            </a>
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            index="01"
            kicker="Ways to work with us"
            title={pick({
              th: "เลือกแบบที่เหมาะกับธุรกิจคุณ",
              en: "Pick the model that fits your business",
            })}
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border lg:grid-cols-3">
            {MODELS.map((model) => (
              <RevealOnScroll key={model.code} className="bg-background">
                <article className="flex h-full flex-col p-6 lg:p-10">
                  <p className="text-4xl font-semibold tracking-tight text-primary">
                    {model.code}
                  </p>
                  <h3 className="mt-2 text-sm font-medium text-muted-foreground">
                    {pick(model.title)}
                  </h3>
                  <p className="mt-6 text-base leading-7 text-pretty">
                    {pick(model.body)}
                  </p>
                  <ul className="mt-6 space-y-2 border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
                    {model.points.map((point) => (
                      <li key={point.en} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2.5 h-px w-3 shrink-0 bg-accent"
                        />
                        {pick(point)}
                      </li>
                    ))}
                  </ul>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20 lg:px-8">
          <SectionHeading
            index="02"
            kicker="What we make"
            title={pick({ th: "ครบในที่เดียว", en: "All in one place" })}
            description={pick({
              th: "ตั้งแต่มู่ลี่ ม่านม้วน ฉากกั้น ไปจนถึงรางม่าน ราวม่าน มอเตอร์ และงานพิมพ์ผ้า",
              en: "From blinds, roller shades and partitions to curtain tracks, rods, motors and fabric printing.",
            })}
            action={
              <Link
                to="/products"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary"
              >
                {pick({ th: "ดูสินค้าทั้งหมด", en: "See all products" })}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
          <ol className="divide-y divide-border border-y border-border">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  to="/products"
                  search={{ category: category.id }}
                  className="group flex min-h-16 items-center gap-6 py-4 hover:text-primary"
                >
                  <span className="brand-index text-muted-foreground">
                    {category.index}
                  </span>
                  <span className="flex-1 text-lg font-semibold">
                    {pick(category.name)}
                  </span>
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="brand-section border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            index="03"
            kicker="How it works"
            title={pick({
              th: "เริ่มต้นใน 4 ขั้น",
              en: "Four steps to get started",
            })}
          />
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li
                key={step.title.en}
                className="border-t-2 border-primary pt-6"
              >
                <span className="brand-index text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold">
                  {pick(step.title)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {pick(step.body)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {dealerProjects.length ? (
        <section className="brand-section border-t border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index="04"
              kicker="Dealer work"
              title={pick({
                th: "งานจริงจากพันธมิตรของเรา",
                en: "Real work from our partners",
              })}
              action={
                <Link
                  to="/projects"
                  search={{ kind: "dealer" }}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary"
                >
                  {pick({ th: "ดูผลงานทั้งหมด", en: "See all projects" })}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              }
            />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {dealerProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="partner-form"
        className="brand-section scroll-mt-24 border-t border-border"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20 lg:px-8">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              index="05"
              kicker="Apply"
              title={pick({
                th: "คุยเรื่องความร่วมมือ",
                en: "Start the conversation",
              })}
              description={pick({
                th: "บอกเราว่าคุณทำธุรกิจแบบไหน ทีมขายจะติดต่อกลับพร้อมเงื่อนไขที่เหมาะสม",
                en: "Tell us about your business and our sales team will come back with suitable terms.",
              })}
            />
            <Link
              to="/contact"
              search={{ topic: "factory-visit" }}
              className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
            >
              <Factory className="size-4" aria-hidden />
              {pick({
                th: "หรือนัดเยี่ยมชม WP ALL",
                en: "Or book a visit",
              })}
            </Link>
          </div>
          <div className="rounded-sm border border-border bg-background p-5 sm:p-8">
            <BusinessContactForm initialTopic="dealer" />
          </div>
        </div>
      </section>
    </>
  );
}
