import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Factory, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";

import { SectionHeading } from "@/components/brand/section-heading";
import { BusinessContactForm } from "@/components/storefront/business-contact-form";
import { ErrorFeedbackForm } from "@/components/errors/error-feedback-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";
import { useBi } from "@/lib/bi";
import { isContactFormTopic } from "@/lib/contact-inquiry";
import {
  defaultFeedbackSubject,
  feedbackCategoryFromKind,
  type ErrorPageKind,
} from "@/lib/error-feedback";
import { pageHead } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const contactSearchSchema = z.object({
  type: z.enum(["feedback"]).optional(),
  topic: z
    .enum(["project", "quote", "factory-visit", "dealer", "profile", "other"])
    .optional(),
  product: z.string().max(80).optional(),
  code: z.preprocess(
    (value) => (value == null || value === "" ? undefined : String(value)),
    z.enum(["404", "403", "500", "error", "generic"]).optional(),
  ),
  from: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/_store/contact")({
  validateSearch: (search) => contactSearchSchema.parse(search),
  head: () =>
    pageHead({
      title: "ติดต่อเรา / ขอใบเสนอราคา | WP ALL",
      description:
        "ขอใบเสนอราคา ปรึกษางานโครงการ สมัครตัวแทน หรือนัดเยี่ยมชม WP ALL ที่คลองสามวา กรุงเทพฯ โทร 02-334-0235 LINE @wpfordealer",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { t, locale } = useT();
  const pick = useBi();
  const address = locale === "en" ? siteConfig.addressEn : siteConfig.address;
  const search = Route.useSearch();
  const isFeedback = search.type === "feedback";
  const kind: ErrorPageKind =
    search.code === "404" ||
    search.code === "403" ||
    search.code === "500" ||
    search.code === "generic"
      ? search.code
      : "generic";

  const initialTopic = isContactFormTopic(search.topic)
    ? search.topic
    : undefined;
  const isVisit = initialTopic === "factory-visit";
  if (isFeedback) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <PageHeader
          title="แจ้งปัญหา / Feedback"
          description="ส่งรายงานปัญหาให้ทีมงาน WP ALL — ไม่ต้องเข้าสู่ระบบก็ส่งได้"
        />
        {search.from ? (
          <p className="mb-4 break-all text-xs text-muted-foreground">
            จากหน้า: {search.from}
          </p>
        ) : null}
        <Card>
          <CardContent className="p-4 pt-5">
            <ErrorFeedbackForm
              category={feedbackCategoryFromKind(kind)}
              errorCode={kind}
              sourceUrl={search.from}
              defaultSubject={defaultFeedbackSubject(kind, search.from)}
              defaultMessage={search.message ?? ""}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = isVisit
    ? pick({ th: "นัดเยี่ยมชมโรงงาน", en: "Book a factory visit" })
    : pick({ th: "ติดต่อเรา", en: "Contact us" });

  const description = isVisit
    ? pick({
        th: "เลือกวันและสายผลิตที่อยากดู ทีมขายจะยืนยันภายใน 1 วันทำการ",
        en: "Pick a date and production line — the sales team will confirm within 1 business day.",
      })
    : pick({
        th: "บอกขนาดหน้าต่างหรือรายละเอียดงาน ทีมงานจะติดต่อกลับพร้อมคำแนะนำและใบเสนอราคา",
        en: "Tell us your window sizes or project details. Our team will get back to you with advice and a quote.",
      });

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-12 sm:px-6 lg:px-8 lg:pt-20">
          <SectionHeading
            as="h1"
            kicker={t("nav.contact")}
            title={title}
            description={description}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:px-8 lg:py-16">
        <div className="rounded-sm border border-border bg-background p-5 sm:p-8">
          <BusinessContactForm
            key={`${initialTopic ?? "default"}-${search.product ?? ""}`}
            initialTopic={initialTopic}
            initialProduct={search.product}
          />
        </div>

        <aside className="space-y-8 lg:sticky lg:top-28">
          <div>
            <p className="brand-kicker text-muted-foreground">Talk to us now</p>
            <div className="mt-4 grid gap-2">
              <a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-between gap-2 rounded-full bg-[#06C755] px-5 text-sm font-semibold text-white hover:brightness-95"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="size-4" aria-hidden />
                  LINE {siteConfig.lineId}
                </span>
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
              <a
                href={`tel:${siteConfig.phoneTel}`}
                className="inline-flex min-h-12 items-center justify-between gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                <span className="inline-flex items-center gap-2">
                  <Phone className="size-4" aria-hidden />
                  {siteConfig.phoneDisplay}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {locale === "en"
                    ? siteConfig.officeLabelEn
                    : siteConfig.officeLabel}
                </span>
              </a>
            </div>
          </div>

          <div>
            <p className="brand-kicker text-muted-foreground">
              {siteConfig.salesLabelEn}
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4">
              {siteConfig.salesPhones.map((phone, index) => (
                <li key={phone.tel}>
                  <a
                    href={`tel:${phone.tel}`}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-primary"
                  >
                    <span className="text-xs font-normal whitespace-nowrap text-muted-foreground">
                      Sale {index + 1}
                    </span>
                    {phone.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-4">
            <img
              src={siteConfig.lineQrSrc}
              alt={`LINE ${siteConfig.lineId}`}
              width={96}
              height={96}
              loading="lazy"
              className="size-24 rounded-sm border border-border bg-white object-cover"
            />
            <p className="text-sm leading-6 text-muted-foreground">
              {pick({
                th: "สแกนเพื่อแอด LINE แล้วส่งรูปหน้างานหรือขนาดหน้าต่างให้เราได้เลย",
                en: "Scan to add us on LINE, then send photos of the site or your window sizes.",
              })}
            </p>
          </div>

          <div className="border-t border-border pt-8">
            <p className="brand-kicker text-muted-foreground">Head office</p>
            <address className="mt-3 text-sm leading-6 not-italic">
              {locale === "en" ? siteConfig.legalNameEn : siteConfig.legalName}
              <br />
              {address.line1} {address.line2}
              <br />
              {address.city}
            </address>
            <div className="mt-4 aspect-[4/3] overflow-hidden rounded-sm border border-border">
              <iframe
                title={pick({ th: "แผนที่ WP ALL", en: "WP ALL map" })}
                src={siteConfig.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5">
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary"
              >
                {pick({ th: "เปิดใน Google Maps", en: "Open in Google Maps" })}
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
              {!isVisit ? (
                <Link
                  to="/contact"
                  search={{ topic: "factory-visit" }}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary"
                >
                  <Factory className="size-4" aria-hidden />
                  {pick({
                    th: "นัดเยี่ยมชมโรงงาน",
                    en: "Book a factory visit",
                  })}
                </Link>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
