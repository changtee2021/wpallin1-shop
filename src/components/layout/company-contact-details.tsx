import { useT } from "@/i18n";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex min-h-11 items-center font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm";
const compactLinkClass =
  "inline-flex min-h-11 items-center font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm sm:min-h-8";

type CompanyContactDetailsProps = {
  className?: string;
  showQr?: boolean;
  compact?: boolean;
  showChannels?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  mapsHref?: string;
  mapsLabel?: string;
};

export function CompanyContactDetails({
  className,
  showQr = true,
  compact = false,
  showChannels = true,
  showEmail = true,
  showAddress = true,
  mapsHref,
  mapsLabel,
}: CompanyContactDetailsProps) {
  const { t, locale } = useT();
  const officeLabel =
    locale === "en" ? siteConfig.officeLabelEn : siteConfig.officeLabel;
  const salesLabel =
    locale === "en" ? siteConfig.salesLabelEn : siteConfig.salesLabel;
  const itemLink = compact ? compactLinkClass : linkClass;
  const address = locale === "en" ? siteConfig.addressEn : siteConfig.address;

  return (
    <div
      className={cn(
        compact ? "space-y-2.5 text-sm" : "space-y-5 text-sm",
        className,
      )}
    >
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("footer.officeTel")}
        </p>
        <p className="mt-2 text-muted-foreground">{officeLabel}</p>
        <a
          href={`tel:${siteConfig.phoneTel}`}
          className={cn(itemLink, "font-medium text-foreground")}
        >
          {siteConfig.phoneDisplay}
        </a>
        <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {salesLabel}
        </p>
        <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
          {siteConfig.salesPhones.map((phone, index) => (
            <li key={phone.tel}>
              <a
                href={`tel:${phone.tel}`}
                className={cn(itemLink, "gap-2 font-medium text-foreground")}
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

      {showChannels || showEmail || showAddress ? (
        <div className={compact ? "space-y-1.5" : "space-y-3"}>
          {showChannels ? (
            <>
              <div className={cn(showQr && "flex items-start gap-3")}>
                {showQr ? (
                  <a
                    href={siteConfig.lineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <img
                      src={siteConfig.lineQrSrc}
                      alt={`LINE ${siteConfig.lineId}`}
                      width={88}
                      height={88}
                      className="size-[88px] rounded-lg bg-white object-cover"
                    />
                  </a>
                ) : null}
                <p>
                  <span className="text-muted-foreground">LINE</span>
                  <br />
                  <a
                    href={siteConfig.lineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      itemLink,
                      "font-semibold text-[#06C755] hover:underline",
                    )}
                  >
                    {siteConfig.lineId}
                  </a>
                </p>
              </div>

              <p>
                <span className="text-muted-foreground">WhatsApp</span>
                <br />
                {siteConfig.whatsapp.map((item, index) => (
                  <span key={item.href}>
                    {index > 0 ? (
                      <span className="text-muted-foreground"> · </span>
                    ) : null}
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        itemLink,
                        "font-semibold text-[#25D366] hover:underline",
                      )}
                    >
                      {item.display}
                    </a>
                  </span>
                ))}
              </p>

              <p>
                <span className="text-muted-foreground">Facebook</span>
                <br />
                <a
                  href={siteConfig.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    itemLink,
                    "font-semibold text-[#1877F2] hover:underline",
                  )}
                >
                  {siteConfig.facebookLabel}
                </a>
              </p>

              <p>
                <span className="text-muted-foreground">
                  {t("footer.website")}
                </span>
                <br />
                <a
                  href={siteConfig.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(itemLink, "font-medium text-foreground")}
                >
                  {siteConfig.websiteDisplay}
                </a>
              </p>
            </>
          ) : null}

          {showEmail ? (
            <p>
              <span className="text-muted-foreground">Email</span>
              <br />
              <a
                href={`mailto:${siteConfig.emailTo}`}
                className={cn(
                  itemLink,
                  "break-all font-medium text-foreground",
                )}
              >
                {siteConfig.emailTo}
              </a>
            </p>
          ) : null}

          {showAddress ? (
            <p
              className={cn(
                "text-foreground/80",
                compact ? "leading-5" : "leading-6",
              )}
            >
              {address.line1}
              <br />
              {address.line2}
              <br />
              {address.city}
              {locale === "en" ? (
                <>
                  <br />
                  {address.country}
                </>
              ) : null}
            </p>
          ) : null}
          {mapsHref && mapsLabel ? (
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className={cn(itemLink, "font-semibold text-foreground")}
            >
              {mapsLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
