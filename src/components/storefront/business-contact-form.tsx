import { Link } from "@tanstack/react-router";
import { Building2, Check, Factory, FileText, Handshake, Loader2, MessageSquare, Receipt } from "lucide-react";
import { useMemo, useState, type ComponentProps, type FormEvent } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOptionalAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";
import { submitContactForm } from "@/lib/api.functions";
import {
  CONTACT_TOPICS,
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
  project: Building2,
  quote: Receipt,
  "factory-visit": Factory,
  dealer: Handshake,
  profile: FileText,
  other: MessageSquare,
} as const;

type FieldErrors = Partial<Record<string, string>>;

type BusinessContactFormProps = {
  initialTopic?: ContactTopic;
};

export function BusinessContactForm({
  initialTopic,
}: BusinessContactFormProps) {
  const { locale } = useT();
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

  const isVisit = inquiryType === "factory-visit";

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

    if (!companyName) next.companyName = locale === "en" ? "Enter company name" : "กรอกชื่อบริษัท";
    if (!name) next.name = locale === "en" ? "Enter contact name" : "กรอกชื่อผู้ติดต่อ";
    if (!phone) next.phone = locale === "en" ? "Enter a phone number" : "กรอกเบอร์โทร";
    if (!email) next.email = locale === "en" ? "Enter email" : "กรอกอีเมล";
    if (!inquiryType) next.inquiryType = locale === "en" ? "Choose a topic" : "เลือกเรื่องที่ติดต่อ";
    if (inquiryType === "other" && !message) {
      next.message = locale === "en" ? "Tell us a bit more" : "บอกเพิ่มเติมหน่อย";
    }
    if (!pdpa) next.pdpaAccepted = locale === "en" ? "Please accept the privacy policy" : "กรุณายินยอมนโยบายความเป็นส่วนตัว";

    if (isVisit) {
      const jobTitle = String(data.get("jobTitle") ?? "").trim();
      const lineId = String(data.get("lineId") ?? "").trim();
      const taxId = String(data.get("taxId") ?? "").replace(/\D/g, "");
      const visitDate = String(data.get("visitDate") ?? "").trim();
      const visitorCount = Number(data.get("visitorCount"));
      const purpose = String(data.get("purpose") ?? "").trim();
      const productInterest = String(data.get("productInterest") ?? "").trim();

      if (!jobTitle) next.jobTitle = locale === "en" ? "Enter job title" : "กรอกตำแหน่ง";
      if (!lineId) next.lineId = locale === "en" ? "Enter LINE ID" : "กรอก LINE ID";
      if (taxId.length !== 13) {
        next.taxId = locale === "en" ? "Enter 13-digit tax or ID number" : "กรอกเลข 13 หลัก";
      }
      if (!visitDate) next.visitDate = locale === "en" ? "Pick a date" : "เลือกวันที่";
      if (!visitorCount || visitorCount < 1) {
        next.visitorCount = locale === "en" ? "Enter visitor count" : "กรอกจำนวนผู้เข้าชม";
      }
      if (visitSites.length === 0) {
        next.visitSites = locale === "en" ? "Pick at least one production line" : "เลือกสายผลิตอย่างน้อย 1 ที่";
      }
      if (!purpose) next.purpose = locale === "en" ? "Pick a purpose" : "เลือกวัตถุประสงค์";
      if (!productInterest) {
        next.productInterest = locale === "en" ? "Tell us which products" : "บอกสินค้าที่สนใจ";
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
      productInterest: isVisit
        ? String(data.get("productInterest") ?? "").trim()
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
      toast.success(
        result.ticketId
          ? locale === "en"
            ? "Sent — our team will contact you"
            : "ส่งแล้ว — ทีมงานจะติดต่อกลับ"
          : locale === "en"
            ? `Received (Ref: ${result.referenceId.slice(0, 8)})`
            : `รับเรื่องแล้ว (Ref: ${result.referenceId.slice(0, 8)})`,
      );
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : locale === "en"
            ? "Could not send"
            : "ส่งไม่สำเร็จ";
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
          {locale === "en" ? "We received your request" : "ได้รับคำขอของท่านแล้ว"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {isVisit
            ? locale === "en"
              ? "This is not a confirmed booking yet. The sales team will call back within 1 business day to confirm the date and time."
              : "คำขอนี้ยังไม่ใช่การยืนยันการนัด — ทีมขายจะติดต่อกลับภายใน 1 วันทำการ เพื่อยืนยันวันเวลา"
            : locale === "en"
              ? "The WP ALL sales team will get back to you by phone, email, or LINE."
              : "ทีมขาย WP ALL จะติดต่อกลับทางโทร อีเมล หรือ LINE"}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => {
            setSubmitted(false);
            setInquiryType(initialTopic ?? "");
            setVisitSites([]);
            setVisitSession("morning");
            setErrors({});
          }}
        >
          {locale === "en" ? "Send another message" : "ส่งข้อความอีกครั้ง"}
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
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
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
          {locale === "en" ? "What can we help with?" : "เรื่องที่ติดต่อ"}
          <span className="ml-1 text-destructive">*</span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CONTACT_TOPICS.map((topic) => {
            const Icon = TOPIC_ICONS[topic];
            const selected = inquiryType === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setInquiryType(topic);
                  setErrors({});
                  setFormError(null);
                }}
                className={cn(
                  "flex min-h-11 items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/8"
                    : "border-border bg-white hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {topicLabel(topic, locale)}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {topicHint(topic, locale)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <FieldError className="mt-2">{errors.inquiryType}</FieldError>
      </fieldset>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">
          {locale === "en" ? "Contact details" : "ข้อมูลผู้ติดต่อ"}
        </h2>
        <Field
          id="companyName"
          name="companyName"
          label={locale === "en" ? "Company / organization" : "ชื่อบริษัท / องค์กร"}
          autoComplete="organization"
          required
          error={errors.companyName}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="name"
            name="name"
            label={locale === "en" ? "Contact name" : "ชื่อผู้ติดต่อ"}
            autoComplete="name"
            required
            defaultValue={(user?.user_metadata?.full_name as string) ?? ""}
            error={errors.name}
          />
          <Field
            id="jobTitle"
            name="jobTitle"
            label={locale === "en" ? "Job title" : "ตำแหน่ง"}
            autoComplete="organization-title"
            required={isVisit}
            placeholder={
              locale === "en"
                ? "e.g. Purchasing manager"
                : "เช่น ผู้จัดการฝ่ายจัดซื้อ"
            }
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
            label={locale === "en" ? "Phone" : "เบอร์โทร"}
            required
            error={errors.phone}
          />
          <Field
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            label={locale === "en" ? "Email" : "อีเมล"}
            required
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
              label={
                locale === "en"
                  ? "Tax ID or national ID"
                  : "เลขนิติบุคคล หรือเลขบัตรประชาชน"
              }
              placeholder="1-2345-67890-12-3"
              required
              error={errors.taxId}
            />
          ) : null}
        </div>
      </section>

      {isVisit ? (
        <section className="space-y-4 border-t border-border pt-5">
          <h2 className="text-sm font-semibold">
            {locale === "en" ? "Visit date and production lines" : "สถานที่และรอบเยี่ยมชม"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {locale === "en"
              ? "WP ALL has 3 production lines. Pick one or all."
              : "โรงงาน WP ALL มี 3 สายผลิต — เลือกได้มากกว่า 1 ที่ หรือไปทั้ง 3 ที่"}
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
              {locale === "en" ? "Visit all 3 lines" : "ไปทั้ง 3 ที่"}
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
                    {locale === "en" ? site.title.en : site.title.th}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {locale === "en" ? site.desc.en : site.desc.th}
                  </span>
                </button>
              );
            })}
          </div>
          <FieldError>{errors.visitSites}</FieldError>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              {locale === "en" ? "Session" : "เลือกรอบเยี่ยมชม"}
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
                      ? locale === "en"
                        ? "Morning"
                        : "รอบเช้า"
                      : locale === "en"
                        ? "Afternoon"
                        : "รอบเย็น"}
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
              label={locale === "en" ? "Preferred date" : "วันที่ต้องการเข้าเยี่ยมชม"}
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
              label={
                locale === "en" ? "Number of visitors" : "จำนวนผู้เข้าเยี่ยมชม (คน)"
              }
              required
              error={errors.visitorCount}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purpose">
              {locale === "en" ? "Purpose of visit" : "วัตถุประสงค์การเยี่ยมชม"}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <select
              id="purpose"
              name="purpose"
              defaultValue=""
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:h-9 md:text-sm"
            >
              <option value="" disabled>
                {locale === "en" ? "Select a purpose" : "เลือกวัตถุประสงค์"}
              </option>
              {VISIT_PURPOSES.map((purpose) => (
                <option key={purpose.id} value={purpose.id}>
                  {locale === "en" ? purpose.label.en : purpose.label.th}
                </option>
              ))}
            </select>
            <FieldError>{errors.purpose}</FieldError>
          </div>

          <Field
            id="productInterest"
            name="productInterest"
            label={locale === "en" ? "Products of interest" : "สินค้าที่สนใจ"}
            placeholder={
              locale === "en"
                ? "e.g. motorized roller, blackout curtains"
                : "เช่น ม่านม้วนมอเตอร์, ผ้าม่านทึบแสง"
            }
            required
            error={errors.productInterest}
          />
        </section>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="message">
          {locale === "en" ? "Details" : "รายละเอียด"}
          {inquiryType === "other" ? (
            <span className="ml-1 text-destructive">*</span>
          ) : (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {locale === "en" ? "(optional)" : "(ไม่บังคับ)"}
            </span>
          )}
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder={
            isVisit
              ? locale === "en"
                ? "e.g. need an interpreter, guests with mobility needs"
                : "เช่น ต้องการล่าม มีผู้สูงอายุร่วมเยี่ยมชม"
              : locale === "en"
                ? "Project size, number of sites, when to call back…"
                : "บอกโปรเจกต์ จำนวนสาขา ช่วงเวลาที่ต้องการติดต่อกลับ"
          }
        />
        <FieldError>{errors.message}</FieldError>
      </div>

      {inquiryType === "dealer" ? (
        <p className="rounded-xl bg-muted/70 px-3 py-2.5 text-sm text-muted-foreground">
          {locale === "en" ? "Want a full dealer account?" : "อยากสมัครตัวแทนเต็มรูปแบบ?"}{" "}
          <Link to="/dealer/register" className="font-semibold text-primary underline">
            {locale === "en" ? "Go to dealer registration" : "ไปที่ฟอร์มสมัครตัวแทน"}
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
          {locale === "en" ? "I agree to the " : "ข้าพเจ้ายินยอมให้เก็บข้อมูลตาม "}
          <Link to="/privacy" className="font-medium text-primary underline">
            {locale === "en" ? "privacy policy" : "นโยบายความเป็นส่วนตัว"}
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
            {locale === "en" ? "Sending…" : "กำลังส่ง..."}
          </>
        ) : isVisit ? (
          locale === "en" ? "Request a factory visit" : "ส่งคำขอนัดเยี่ยมชม"
        ) : (
          locale === "en" ? "Send message" : "ส่งข้อความถึงเรา"
        )}
      </Button>
      {isVisit ? (
        <p className="text-xs text-muted-foreground">
          {locale === "en"
            ? "The team will confirm the visit before the date — this request is not a booking yet."
            : "ทีมงานจะติดต่อยืนยันวันเวลาก่อนวันเยี่ยมชมจริง — คำขอนี้ยังไม่ใช่การยืนยันการนัด"}
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
