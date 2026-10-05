import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useT } from "@/i18n";
import { useBi, type Bi } from "@/lib/bi";
import { pageHead } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type FaqLinkTarget =
  "quote" | "visit" | "catalogs" | "nano" | "print" | "partners";
type FaqEntry = {
  id: string;
  question: Bi;
  answer: Bi;
  link?: { target: FaqLinkTarget; label: Bi };
};
type FaqGroup = { id: string; title: Bi; items: FaqEntry[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "order",
    title: { th: "ราคาและการสั่งซื้อ", en: "Pricing & ordering" },
    items: [
      {
        id: "no-price",
        question: {
          th: "ทำไมเว็บไซต์ไม่แสดงราคา?",
          en: "Why are there no prices on the website?",
        },
        answer: {
          th: "สินค้าส่วนใหญ่ผลิตตามขนาดหน้าต่างจริง ราคาจึงขึ้นกับขนาด รุ่น สี และระบบควบคุม ส่งขนาดมาให้ทีมงาน แล้วเราจะทำใบเสนอราคาให้ตามงานของคุณ",
          en: "Most products are made to your exact window sizes, so the price depends on size, model, colour and control. Send us your sizes and we'll prepare a quote for your job.",
        },
        link: {
          target: "quote",
          label: { th: "ขอใบเสนอราคา", en: "Request a quote" },
        },
      },
      {
        id: "retail",
        question: {
          th: "ลูกค้าทั่วไปสั่งซื้อได้ไหม?",
          en: "Can homeowners order directly?",
        },
        answer: {
          th: "ได้ ทั้งลูกค้าบ้านพักอาศัยและร้านตัวแทนขอใบเสนอราคาได้ ทีมขายจะแนะนำช่องทางสั่งซื้อที่เหมาะกับงานของคุณ",
          en: "Yes. Both homeowners and dealers can request a quote — our sales team will suggest the best way to order for your job.",
        },
      },
      {
        id: "lead-time",
        question: {
          th: "ใช้เวลาผลิตนานเท่าไร?",
          en: "How long does production take?",
        },
        answer: {
          th: "ขึ้นกับรุ่นและจำนวนที่สั่ง ทีมขายจะแจ้งกำหนดส่งพร้อมใบเสนอราคา",
          en: "It depends on the model and quantity. Our sales team will confirm the lead time with your quote.",
        },
      },
    ],
  },
  {
    id: "measure",
    title: { th: "การวัดและเลือกสินค้า", en: "Measuring & choosing" },
    items: [
      {
        id: "how-measure",
        question: {
          th: "ต้องวัดขนาดหน้าต่างอย่างไร?",
          en: "How should I measure my windows?",
        },
        answer: {
          th: "วัดความกว้างและความสูงเป็นเซนติเมตร แจ้งว่าจะติดในกรอบหรือนอกกรอบหน้าต่าง ถ้าไม่แน่ใจ ถ่ายรูปหน้างานพร้อมตลับเมตรส่งมาทาง LINE ทีมงานช่วยดูให้",
          en: "Measure width and height in centimetres and tell us whether it fits inside or outside the frame. Not sure? Send photos of the window with a tape measure on LINE and we'll help.",
        },
      },
      {
        id: "samples",
        question: {
          th: "ขอดูตัวอย่างสีหรือแคตตาล็อกได้ไหม?",
          en: "Can I see colour samples or a catalogue?",
        },
        answer: {
          th: "ได้ ดาวน์โหลดแคตตาล็อกได้ที่หน้าแคตตาล็อก หรือขอตัวอย่างสีและวัสดุจากทีมขาย สีบนหน้าจออาจต่างจากของจริงเล็กน้อย",
          en: "Yes. Download catalogues from the catalogue page, or ask our sales team for colour and material samples. Colours on screen can differ slightly from the real thing.",
        },
        link: {
          target: "catalogs",
          label: { th: "ดูแคตตาล็อก", en: "Browse catalogues" },
        },
      },
      {
        id: "motor",
        question: {
          th: "ม่านมอเตอร์ควบคุมแบบไหนได้บ้าง?",
          en: "How can motorised curtains be controlled?",
        },
        answer: {
          th: "มอเตอร์ WP Nano Power และ WP N23 ใช้ได้ทั้งรีโมท 1, 2 และ 6 ช่อง สวิตช์ติดผนัง และควบคุมผ่านมือถือ",
          en: "WP Nano Power and WP N23 motors work with 1, 2 or 6-channel remotes, wall switches and mobile app control.",
        },
        link: {
          target: "nano",
          label: { th: "ดู WP Nano Power", en: "See WP Nano Power" },
        },
      },
      {
        id: "print",
        question: {
          th: "พิมพ์ลายหรือรูปของเราเองลงผ้าได้ไหม?",
          en: "Can you print our own design on fabric?",
        },
        answer: {
          th: "ได้ ส่งไฟล์ภาพหรือแบบที่ต้องการ เราพิมพ์ลงผ้าม่าน ม่านม้วน หรือผ้าโนเรนได้ตามขนาดงาน",
          en: "Yes. Send us the image or artwork and we'll print it onto curtains, roller blinds or noren fabric at your size.",
        },
        link: {
          target: "print",
          label: { th: "ดูงานพิมพ์ผ้า", en: "See custom printing" },
        },
      },
    ],
  },
  {
    id: "company",
    title: { th: "ตัวแทนและโรงงาน", en: "Dealers & factory" },
    items: [
      {
        id: "dealer",
        question: {
          th: "สมัครเป็นตัวแทนจำหน่ายอย่างไร?",
          en: "How do I become a dealer?",
        },
        answer: {
          th: "กรอกฟอร์มที่หน้าพันธมิตรหรือทัก LINE ทีมขายจะติดต่อกลับพร้อมเงื่อนไข เรารับงาน OEM / ODM ด้วย",
          en: "Fill in the form on the partners page or message us on LINE — our sales team will come back with terms. We also take OEM / ODM work.",
        },
        link: {
          target: "partners",
          label: { th: "ไปหน้าพันธมิตร", en: "Go to partners" },
        },
      },
      {
        id: "visit",
        question: {
          th: "เข้าเยี่ยมชมโรงงานได้ไหม?",
          en: "Can I visit the factory?",
        },
        answer: {
          th: "ได้ นัดล่วงหน้าผ่านฟอร์มเยี่ยมชมโรงงาน โรงงานอยู่ที่ซอยเจริญพัฒนา 11 เขตคลองสามวา กรุงเทพฯ",
          en: "Yes — book ahead with the factory-visit form. We're at Soi Charoen Phatthana 11, Khlong Sam Wa, Bangkok.",
        },
        link: {
          target: "visit",
          label: { th: "นัดเยี่ยมชมโรงงาน", en: "Book a visit" },
        },
      },
    ],
  },
];

export const Route = createFileRoute("/_store/faq")({
  head: () =>
    pageHead({
      title: "คำถามที่พบบ่อย | WP ALL",
      description:
        "คำตอบเรื่องราคา การวัดขนาดหน้าต่าง ตัวอย่างสี ม่านมอเตอร์ งานพิมพ์ผ้า การสมัครตัวแทน และการเยี่ยมชมโรงงาน WP ALL",
      path: "/faq",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_GROUPS.flatMap((group) =>
          group.items.map((item) => ({
            "@type": "Question",
            name: item.question.th,
            acceptedAnswer: { "@type": "Answer", text: item.answer.th },
          })),
        ),
      },
    }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useT();
  const pick = useBi();

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-12 sm:px-6 lg:px-8 lg:pt-20">
          <SectionHeading
            as="h1"
            kicker={t("nav.faq")}
            title={pick({
              th: "คำถามที่พบบ่อย",
              en: "Frequently asked questions",
            })}
            description={pick({
              th: "ไม่เจอคำตอบที่ต้องการ? ทัก LINE หรือโทรหาทีมงานได้เลย",
              en: "Can't find what you need? Message us on LINE or give us a call.",
            })}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20 lg:px-8 lg:py-16">
        <nav
          aria-label={pick({ th: "หมวดคำถาม", en: "Question topics" })}
          className="hidden lg:block"
        >
          <ol className="sticky top-28 space-y-1">
            {FAQ_GROUPS.map((group, index) => (
              <li key={group.id}>
                <a
                  href={`#faq-${group.id}`}
                  className="flex min-h-11 items-center gap-3 text-sm text-muted-foreground hover:text-primary"
                >
                  <span className="brand-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {pick(group.title)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-14">
          {FAQ_GROUPS.map((group, index) => (
            <section
              key={group.id}
              id={`faq-${group.id}`}
              className="scroll-mt-28"
            >
              <h2 className="flex items-baseline gap-3 text-2xl font-semibold">
                <span className="brand-index text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {pick(group.title)}
              </h2>
              <Accordion
                type="multiple"
                className="mt-6 border-t border-border"
              >
                {group.items.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="min-h-14 text-left text-base font-medium hover:no-underline">
                      {pick(item.question)}
                    </AccordionTrigger>
                    <AccordionContent className="max-w-3xl text-base leading-7 text-muted-foreground">
                      <p>{pick(item.answer)}</p>
                      {item.link ? (
                        <FaqLink
                          target={item.link.target}
                          label={pick(item.link.label)}
                        />
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}

          <div className="flex flex-col gap-4 rounded-sm bg-primary-deep p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="text-lg font-semibold">
              {pick({ th: "ยังมีคำถามอยู่?", en: "Still have questions?" })}
            </p>
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#06C755] px-6 text-sm font-semibold text-white hover:brightness-95"
            >
              <MessageCircle className="size-4" aria-hidden />
              LINE {siteConfig.lineId}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

const FAQ_LINK_CLASS =
  "mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline";

function FaqLink({
  target,
  label,
}: {
  target: FaqLinkTarget;
  label: ReactNode;
}) {
  const children = <>{label} →</>;
  switch (target) {
    case "quote":
      return (
        <Link
          to="/contact"
          search={{ topic: "quote" }}
          className={FAQ_LINK_CLASS}
        >
          {children}
        </Link>
      );
    case "visit":
      return (
        <Link
          to="/contact"
          search={{ topic: "factory-visit" }}
          className={FAQ_LINK_CLASS}
        >
          {children}
        </Link>
      );
    case "catalogs":
      return (
        <Link to="/catalogs" className={FAQ_LINK_CLASS}>
          {children}
        </Link>
      );
    case "nano":
      return (
        <Link
          to="/products/$slug"
          params={{ slug: "wp-nano-power" }}
          className={FAQ_LINK_CLASS}
        >
          {children}
        </Link>
      );
    case "print":
      return (
        <Link
          to="/products"
          search={{ category: "custom-print" }}
          className={FAQ_LINK_CLASS}
        >
          {children}
        </Link>
      );
    case "partners":
      return (
        <Link to="/partners" className={FAQ_LINK_CLASS}>
          {children}
        </Link>
      );
  }
}
