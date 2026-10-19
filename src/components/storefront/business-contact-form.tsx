import { Link } from "@tanstack/react-router";
import { Check, Factory, Handshake, Loader2 } from "lucide-react";
import { useMemo, useState, type ComponentProps, type FormEvent } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATALOG_PRODUCTS, getCatalogProduct } from "@/data/products-catalog";
import { useOptionalAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";
import { submitContactForm } from "@/lib/api.functions";
import { bi, type Bi } from "@/lib/bi";
import { COMMERCE_ENABLED } from "@/lib/features";
import { siteConfig } from "@/lib/site-config";
import {
  CONTACT_FORM_TOPICS,
  VISIT_PURPOSES,
  VISIT_SITES,
  VISIT_SITE_IDS,
  formatBusinessContact,
  isContactTopic,
  todayInputValue,
  topicHint,
  topicLabel,
  type ContactTopic,
  type VisitSession,
  type VisitSiteId,
} from "@/lib/contact-inquiry";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { cn } from "@/lib/utils";

const TOPIC_ICONS = {
  "factory-visit": Factory,
  dealer: Handshake,
} as const;

type FieldErrors = Partial<Record<string, string>>;

/** Topics where we deal with a company, so the company name is required. */
const COMPANY_TOPICS: ContactTopic[] = [
  "project",
  "factory-visit",
  "dealer",
  "profile",
];

type BusinessContactFormProps = {
  initialTopic?: ContactTopic;
  /** Catalogue slug from `/contact?product=` — pre-selects the product of interest. */
  initialProduct?: string;
};

export function BusinessContactForm({
  initialTopic,
  initialProduct,
}: BusinessContactFormProps) {
  const { locale } = useT();
  const pick = (value: Bi) => bi(locale, value);
  const initialProductName = initialProduct
    ? getCatalogProduct(initialProduct)?.name
    : undefined;
  const auth = useOptionalAuth();
  const session = auth?.session ?? null;
  const user = auth?.user ?? null;
  const minDate = useMemo(() => todayInputValue(), []);

  const [inquiryType, setInquiryType] = useState<ContactTopic | "">(
    initialTopic ?? "",
  );
  const [visitSession, setVisitSession] = useState<VisitSession>("morning");
  const [visitSites, setVisitSites] = useState<VisitSiteId[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const [reference, setReference] = useState<string | null>(null);

  const activeTopicIndex = CONTACT_FORM_TOPICS.findIndex(
    (topic) => topic === inquiryType,
  );
  const isVisit = inquiryType === "factory-visit";
  const isQuote = inquiryType === "quote";
  const needsCompany =
    inquiryType !== "" && COMPANY_TOPICS.includes(inquiryType);

  function toggleSite(id: VisitSiteId) {
    setVisitSites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleAllSites() {
    setVisitSites((prev) =>
      prev.length === VISIT_SITE_IDS.length ? [] : [...VISIT_SITE_IDS],
    );
  }

  function validate(form: HTMLFormElement): FieldErrors {
    const data = new FormData(form);
    const next: FieldErrors = {};
    const companyName = String(data.get("companyName") ?? "").trim();
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const pdpa = data.get("pdpaAccepted") === "on";

    if (needsCompany && !companyName)
      next.companyName = bi(locale, {
        th: "กรอกชื่อบริษัท",
        en: "Enter company name",
      });
    if (!name)
      next.name = bi(locale, {
        th: "กรอกชื่อผู้ติดต่อ",
        en: "Enter contact name",
      });
    if (!phone)
      next.phone = bi(locale, {
        th: "กรอกเบอร์โทร",
        en: "Enter a phone number",
      });
    if (!email && !isQuote)
      next.email = bi(locale, { th: "กรอกอีเมล", en: "Enter email" });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      next.email = bi(locale, {
        th: "รูปแบบอีเมลไม่ถูกต้อง",
        en: "Check the email address",
      });
    }
    if (!inquiryType)
      next.inquiryType = bi(locale, {
        th: "เลือกเรื่องที่ติดต่อ",
        en: "Choose a topic",
      });
    if (inquiryType === "other" && !message) {
      next.message = bi(locale, {
        th: "บอกเพิ่มเติมหน่อย",
        en: "Tell us a bit more",
      });
    }
    if (!pdpa)
      next.pdpaAccepted = bi(locale, {
        th: "กรุณายินยอมนโยบายความเป็นส่วนตัว",
        en: "Please accept the privacy policy",
      });

    if (isVisit) {
      const jobTitle = String(data.get("jobTitle") ?? "").trim();
      const lineId = String(data.get("lineId") ?? "").trim();
      const taxId = String(data.get("taxId") ?? "").replace(/\D/g, "");
      const visitDate = String(data.get("visitDate") ?? "").trim();
      const visitorCount = Number(data.get("visitorCount"));
      const purpose = String(data.get("purpose") ?? "").trim();
      const productInterest = String(data.get("productInterest") ?? "").trim();

      if (!jobTitle)
        next.jobTitle = bi(locale, {
          th: "กรอกตำแหน่ง",
          en: "Enter job title",
        });
      if (!lineId)
        next.lineId = bi(locale, { th: "กรอก LINE ID", en: "Enter LINE ID" });
      if (taxId.length !== 13) {
        next.taxId = bi(locale, {
          th: "กรอกเลข 13 หลัก",
          en: "Enter 13-digit tax or ID number",
        });
      }
      if (!visitDate)
        next.visitDate = bi(locale, { th: "เลือกวันที่", en: "Pick a date" });
      if (!visitorCount || visitorCount < 1) {
        next.visitorCount = bi(locale, {
          th: "กรอกจำนวนผู้เข้าชม",
          en: "Enter visitor count",
        });
      }
      if (visitSites.length === 0) {
        next.visitSites = bi(locale, {
          th: "เลือกสายผลิตอย่างน้อย 1 ที่",
          en: "Pick at least one production line",
        });
      }
      if (!purpose)
        next.purpose = bi(locale, {
          th: "เลือกวัตถุประสงค์",
          en: "Pick a purpose",
        });
      if (!productInterest) {
        next.productInterest = bi(locale, {
          th: "บอกสินค้าที่สนใจ",
          en: "Tell us which products",
        });
      }
    }

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    const data = new FormData(form);
    if (!isContactTopic(inquiryType)) return;

    const payload = {
      companyName: String(data.get("companyName") ?? "").trim(),
      name: String(data.get("name") ?? "").trim(),
      jobTitle: String(data.get("jobTitle") ?? "").trim() || undefined,
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      lineId: String(data.get("lineId") ?? "").trim() || undefined,
      taxId: String(data.get("taxId") ?? "").replace(/\D/g, "") || undefined,
      inquiryType,
      message: String(data.get("message") ?? "").trim() || undefined,
      visitDate: isVisit ? String(data.get("visitDate") ?? "") : undefined,
      visitSession: isVisit ? visitSession : undefined,
      visitorCount: isVisit ? Number(data.get("visitorCount")) : undefined,
      visitSites: isVisit ? visitSites : undefined,
      purpose: isVisit ? String(data.get("purpose") ?? "") : undefined,
      productInterest:
        isVisit || isQuote
          ? String(data.get("productInterest") ?? "").trim() || undefined
          : undefined,
    };

    const formatted = formatBusinessContact(payload, locale);

    setSubmitting(true);
    try {
      const result = await submitContactForm({
        data: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          subject: formatted.subject,
          message: formatted.message,
          category: "contact",
          sourceUrl: window.location.href,
          companyWebsite: honeypot,
          companyName: payload.companyName,
          jobTitle: payload.jobTitle,
          lineId: payload.lineId,
          taxId: payload.taxId,
          inquiryType: payload.inquiryType,
          visitDate: payload.visitDate,
          visitSession: payload.visitSession,
          visitorCount: payload.visitorCount,
          visitSites: payload.visitSites,
          purpose: payload.purpose,
          productInterest: payload.productInterest,
        },
        ...authServerFnOptions(session),
      });
      const shortRef =
        result.referenceId.length > 16
          ? result.referenceId.slice(0, 8)
          : result.referenceId;
      toast.success(
        bi(locale, {
          th: `รับเรื่องแล้ว (Ref: ${shortRef})`,
          en: `Received (Ref: ${shortRef})`,
          "zh-hans": `已收到（编号：${shortRef}）`,
          "zh-hant": `已收到（編號：${shortRef}）`,
        }),
      );
      setReference(shortRef);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : bi(locale, { th: "ส่งไม่สำเร็จ", en: "Could not send" });
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-6" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold sm:text-xl">
          {bi(locale, {
            th: "ได้รับคำขอของท่านแล้ว",
            en: "We received your request",
          })}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {isVisit
            ? bi(locale, {
                th: "คำขอนี้ยังไม่ใช่การยืนยันการนัด — ทีมขายจะติดต่อกลับภายใน 1 วันทำการ เพื่อยืนยันวันเวลา",
                en: "This is not a confirmed booking yet. The sales team will call back within 1 business day to confirm the date and time.",
              })
            : bi(locale, {
                th: "ทีมขาย WP ALL จะติดต่อกลับทางโทร อีเมล หรือ LINE",
                en: "The WP ALL sales team will get back to you by phone, email, or LINE.",
              })}
        </p>
        {reference ? (
          <p className="mt-3 text-sm">
            {bi(locale, { th: "เลขอ้างอิง", en: "Reference" })}:{" "}
            <span className="font-semibold">{reference}</span>
          </p>
        ) : null}
        {isQuote ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {bi(locale, {
              th: "มีรูปหน้าต่างหรือหน้างาน ส่งให้เราทาง LINE พร้อมเลขอ้างอิงได้เลย",
              en: "Have photos of the windows or the site? Send them to us on LINE with your reference number.",
            })}{" "}
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline"
            >
              LINE {siteConfig.lineId}
            </a>
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => {
            setSubmitted(false);
            setReference(null);
            setInquiryType(initialTopic ?? "");
            setVisitSites([]);
            setVisitSession("morning");
            setErrors({});
          }}
        >
          {bi(locale, { th: "ส่งข้อความอีกครั้ง", en: "Send another message" })}
        </Button>
      </div>
    );
  }

  return (
    <form
      id="contact-form"
      className="space-y-6 text-left"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <div
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        aria-hidden
      >
        <Label htmlFor="biz-company-website">Company website</Label>
        <Input
          id="biz-company-website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">
          {bi(locale, { th: "เรื่องที่ติดต่อ", en: "What can we help with?" })}
          <span className="ml-1 text-destructive">*</span>
        </legend>
        <div
          role="radiogroup"
          aria-label={bi(locale, {
            th: "เรื่องที่ติดต่อ",
            en: "What can we help with?",
          })}
          className="relative mt-3 grid grid-cols-2 rounded-full border border-border bg-muted/60 p-1"
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-sm transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
              activeTopicIndex < 0 && "opacity-0",
            )}
            style={{
              transform: `translateX(${Math.max(activeTopicIndex, 0) * 100}%)`,
            }}
          />
          {CONTACT_FORM_TOPICS.map((topic) => {
            const Icon = TOPIC_ICONS[topic];
            const selected = inquiryType === topic;
            return (
              <button
                key={topic}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setInquiryType(topic);
                  setErrors({});
                  setFormError(null);
                }}
                className={cn(
                  "relative z-10 flex min-h-11 items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-sm leading-tight font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  selected
                    ? "text-primary-foreground"
                    : "text-foreground hover:text-primary",
                )}
              >
                <Icon className="hidden size-4 shrink-0 sm:block" aria-hidden />
                <span>{topicLabel(topic, locale)}</span>
              </button>
            );
          })}
        </div>
        {inquiryType ? (
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            {topicHint(inquiryType, locale)}
          </p>
        ) : null}
        <FieldError className="mt-2">{errors.inquiryType}</FieldError>
      </fieldset>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">
          {bi(locale, { th: "ข้อมูลผู้ติดต่อ", en: "Contact details" })}
        </h2>
        <Field
          id="companyName"
          name="companyName"
          label={
            needsCompany
              ? bi(locale, {
                  th: "ชื่อบริษัท / องค์กร",
                  en: "Company / organization",
                })
              : bi(locale, {
                  th: "ชื่อบริษัท / ร้าน (ถ้ามี)",
                  en: "Company / shop (optional)",
                })
          }
          autoComplete="organization"
          required={needsCompany}
          error={errors.companyName}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="name"
            name="name"
            label={bi(locale, { th: "ชื่อผู้ติดต่อ", en: "Contact name" })}
            autoComplete="name"
            required
            defaultValue={(user?.user_metadata?.full_name as string) ?? ""}
            error={errors.name}
          />
          <Field
            id="jobTitle"
            name="jobTitle"
            label={bi(locale, { th: "ตำแหน่ง", en: "Job title" })}
            autoComplete="organization-title"
            required={isVisit}
            placeholder={bi(locale, {
              th: "เช่น ผู้จัดการฝ่ายจัดซื้อ",
              en: "e.g. Purchasing manager",
            })}
            error={errors.jobTitle}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            label={bi(locale, { th: "เบอร์โทร", en: "Phone" })}
            required
            error={errors.phone}
          />
          <Field
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            label={bi(locale, { th: "อีเมล", en: "Email" })}
            required={!isQuote}
            defaultValue={user?.email ?? ""}
            error={errors.email}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="lineId"
            name="lineId"
            label="LINE ID"
            required={isVisit}
            error={errors.lineId}
          />
          {isVisit ? (
            <Field
              id="taxId"
              name="taxId"
              inputMode="numeric"
              label={bi(locale, {
                th: "เลขนิติบุคคล หรือเลขบัตรประชาชน",
                en: "Tax ID or national ID",
              })}
              placeholder="1-2345-67890-12-3"
              required
              error={errors.taxId}
            />
          ) : null}
        </div>
      </section>

      {isQuote ? (
        <div className="space-y-1.5">
          <Label htmlFor="productInterest">
            {bi(locale, { th: "สินค้าที่สนใจ", en: "Product of interest" })}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {bi(locale, { th: "(ไม่บังคับ)", en: "(optional)" })}
            </span>
          </Label>
          <select
            id="productInterest"
            name="productInterest"
            defaultValue={initialProductName ? pick(initialProductName) : ""}
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] md:text-sm"
          >
            <option value="">
              {bi(locale, {
                th: "ยังไม่แน่ใจ / หลายรายการ",
                en: "Not sure yet / several products",
              })}
            </option>
            {CATALOG_PRODUCTS.map((product) => (
              <option key={product.slug} value={pick(product.name)}>
                {pick(product.name)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {isVisit ? (
        <section className="space-y-4 border-t border-border pt-5">
          <h2 className="text-sm font-semibold">
            {bi(locale, {
              th: "สถานที่และรอบเยี่ยมชม",
              en: "Visit date and production lines",
            })}
          </h2>
          <p className="text-xs text-muted-foreground">
            {bi(locale, {
              th: "โรงงาน WP ALL มี 3 สายผลิต — เลือกได้มากกว่า 1 ที่ หรือไปทั้ง 3 ที่",
              en: "WP ALL has 3 production lines. Pick one or all.",
            })}
          </p>

          <button
            type="button"
            onClick={toggleAllSites}
            className={cn(
              "flex min-h-11 w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left",
              visitSites.length === VISIT_SITE_IDS.length
                ? "border-primary bg-primary/8"
                : "border-border bg-white hover:border-primary/40",
            )}
          >
            <span className="block text-sm font-semibold">
              {bi(locale, { th: "ไปทั้ง 3 ที่", en: "Visit all 3 lines" })}
            </span>
          </button>
          <div className="grid gap-2 sm:grid-cols-3">
            {VISIT_SITES.map((site) => {
              const checked = visitSites.includes(site.id);
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => toggleSite(site.id)}
                  className={cn(
                    "flex min-h-11 flex-col items-start rounded-xl border px-3.5 py-3 text-left",
                    checked
                      ? "border-primary bg-primary/8"
                      : "border-border bg-white hover:border-primary/40",
                  )}
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {site.no}
                  </span>
                  <span className="mt-1 text-sm font-semibold">
                    {bi(locale, site.title)}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {bi(locale, site.desc)}
                  </span>
                </button>
              );
            })}
          </div>
          <FieldError>{errors.visitSites}</FieldError>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              {bi(locale, { th: "เลือกรอบเยี่ยมชม", en: "Session" })}
              <span className="ml-1 text-destructive">*</span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["morning", "evening"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVisitSession(value)}
                  className={cn(
                    "min-h-11 rounded-xl border px-3.5 py-3 text-left",
                    visitSession === value
                      ? "border-primary bg-primary/8"
                      : "border-border bg-white hover:border-primary/40",
                  )}
                >
                  <span className="block text-sm font-semibold">
                    {value === "morning"
                      ? bi(locale, { th: "รอบเช้า", en: "Morning" })
                      : bi(locale, { th: "รอบเย็น", en: "Afternoon" })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {value === "morning" ? "09:00–12:00" : "13:00–16:00"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="visitDate"
              name="visitDate"
              type="date"
              min={minDate}
              label={bi(locale, {
                th: "วันที่ต้องการเข้าเยี่ยมชม",
                en: "Preferred date",
              })}
              required
              error={errors.visitDate}
            />
            <Field
              id="visitorCount"
              name="visitorCount"
              type="number"
              min={1}
              max={100}
              defaultValue="1"
              label={bi(locale, {
                th: "จำนวนผู้เข้าเยี่ยมชม (คน)",
                en: "Number of visitors",
              })}
              required
              error={errors.visitorCount}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purpose">
              {bi(locale, {
                th: "วัตถุประสงค์การเยี่ยมชม",
                en: "Purpose of visit",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <select
              id="purpose"
              name="purpose"
              defaultValue=""
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:h-9 md:text-sm"
            >
              <option value="" disabled>
                {bi(locale, {
                  th: "เลือกวัตถุประสงค์",
                  en: "Select a purpose",
                })}
              </option>
              {VISIT_PURPOSES.map((purpose) => (
                <option key={purpose.id} value={purpose.id}>
                  {bi(locale, purpose.label)}
                </option>
              ))}
            </select>
            <FieldError>{errors.purpose}</FieldError>
          </div>

          <Field
            id="productInterest"
            name="productInterest"
            label={bi(locale, {
              th: "สินค้าที่สนใจ",
              en: "Products of interest",
            })}
            placeholder={bi(locale, {
              th: "เช่น ม่านม้วนมอเตอร์, ผ้าม่านทึบแสง",
              en: "e.g. motorized roller, blackout curtains",
            })}
            required
            error={errors.productInterest}
          />
        </section>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="message">
          {bi(locale, { th: "รายละเอียด", en: "Details" })}
          {inquiryType === "other" ? (
            <span className="ml-1 text-destructive">*</span>
          ) : (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {bi(locale, { th: "(ไม่บังคับ)", en: "(optional)" })}
            </span>
          )}
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder={
            isVisit
              ? bi(locale, {
                  th: "เช่น ต้องการล่าม มีผู้สูงอายุร่วมเยี่ยมชม",
                  en: "e.g. need an interpreter, guests with mobility needs",
                })
              : isQuote
                ? bi(locale, {
                    th: "ขนาดหน้าต่าง (กว้าง × สูง) จำนวนบาน ห้องที่ติดตั้ง พื้นที่ติดตั้ง",
                    en: "Window sizes (width × height), number of windows, room, installation area…",
                  })
                : bi(locale, {
                    th: "บอกโปรเจกต์ จำนวนสาขา ช่วงเวลาที่ต้องการติดต่อกลับ",
                    en: "Project size, number of sites, when to call back…",
                  })
          }
        />
        <FieldError>{errors.message}</FieldError>
      </div>

      {inquiryType === "dealer" && COMMERCE_ENABLED ? (
        <p className="rounded-xl bg-muted/70 px-3 py-2.5 text-sm text-muted-foreground">
          {bi(locale, {
            th: "อยากสมัครตัวแทนเต็มรูปแบบ?",
            en: "Want a full dealer account?",
          })}{" "}
          <Link
            to="/dealer/register"
            className="font-semibold text-primary underline"
          >
            {bi(locale, {
              th: "ไปที่ฟอร์มสมัครตัวแทน",
              en: "Go to dealer registration",
            })}
          </Link>
        </p>
      ) : null}

      <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          name="pdpaAccepted"
          className="mt-1 size-5 shrink-0 rounded border-input"
        />
        <span>
          {bi(locale, {
            th: "ข้าพเจ้ายินยอมให้เก็บข้อมูลตาม ",
            en: "I agree to the ",
          })}
          <Link to="/privacy" className="font-medium text-primary underline">
            {bi(locale, { th: "นโยบายความเป็นส่วนตัว", en: "privacy policy" })}
          </Link>
          <span className="ml-1 text-destructive">*</span>
        </span>
      </label>
      <FieldError>{errors.pdpaAccepted}</FieldError>

      {formError ? <FieldError>{formError}</FieldError> : null}

      <Button
        type="submit"
        disabled={submitting}
        className="min-h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {bi(locale, { th: "กำลังส่ง...", en: "Sending…" })}
          </>
        ) : isVisit ? (
          bi(locale, {
            th: "ส่งคำขอนัดเยี่ยมชม",
            en: "Request a factory visit",
          })
        ) : (
          bi(locale, { th: "ส่งข้อความถึงเรา", en: "Send message" })
        )}
      </Button>
      {isVisit ? (
        <p className="text-xs text-muted-foreground">
          {bi(locale, {
            th: "ทีมงานจะติดต่อยืนยันวันเวลาก่อนวันเยี่ยมชมจริง — คำขอนี้ยังไม่ใช่การยืนยันการนัด",
            en: "The team will confirm the visit before the date — this request is not a booking yet.",
          })}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  id,
  name,
  label,
  error,
  required,
  ...props
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  required?: boolean;
} & ComponentProps<typeof Input>) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      <Input
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
