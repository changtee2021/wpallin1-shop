import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { TranslationKey } from "@/i18n/types";
import {
  pickLocalized,
  type ResolvedMaterialProfile,
} from "@/lib/inspiration-material-profiles";
import type { Locale } from "@/i18n/types";
import type { MaterialSpecRow } from "@/lib/inspiration-material-detail";

type Props = {
  profile: ResolvedMaterialProfile;
  basicSpecRows: MaterialSpecRow[];
  locale: Locale;
  t: (key: TranslationKey) => string;
  title: string;
  labels: {
    composition: string;
    texture: string;
    certifications: string;
    suitableRooms: string;
    bestFor: string;
    care: string;
    observedRooms: string;
  };
};

function SpecRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border/60 px-0 py-3 last:border-0 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function InspirationMaterialSpecPanel({
  profile,
  basicSpecRows,
  locale,
  t,
  title,
  labels,
}: Props) {
  const suitableRooms = [
    ...profile.observedRoomTypes,
    ...profile.suitableRooms.map((item) => pickLocalized(item, locale)),
  ].filter((value, index, array) => array.indexOf(value) === index);

  return (
    <section className="rounded-xl border border-border bg-muted/20 p-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <dl className="mt-3">
        {basicSpecRows.map((row) => (
          <SpecRow key={row.labelKey} label={t(row.labelKey)}>
            <span className="font-medium">{t(row.valueKey)}</span>
          </SpecRow>
        ))}

        <SpecRow label={labels.composition}>
          <p className="leading-relaxed text-muted-foreground">
            {pickLocalized(profile.composition, locale)}
          </p>
        </SpecRow>

        <SpecRow label={labels.texture}>
          <p className="leading-relaxed text-muted-foreground">
            {pickLocalized(profile.texture, locale)}
          </p>
        </SpecRow>

        {profile.specifications.map((row) => (
          <SpecRow
            key={pickLocalized(row.label, locale)}
            label={pickLocalized(row.label, locale)}
          >
            <span className="font-medium">
              {pickLocalized(row.value, locale)}
            </span>
          </SpecRow>
        ))}

        {profile.dynamicSpecifications.map((row) => (
          <SpecRow key={`${row.label}-${row.value}`} label={row.label}>
            <span className="font-medium">{row.value}</span>
          </SpecRow>
        ))}

        <SpecRow label={labels.certifications}>
          <ul className="space-y-2">
            {profile.certifications.map((cert) => (
              <li key={pickLocalized(cert.label, locale)}>
                <p className="font-medium">
                  {pickLocalized(cert.label, locale)}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {pickLocalized(cert.detail, locale)}
                </p>
              </li>
            ))}
          </ul>
        </SpecRow>

        <SpecRow label={labels.suitableRooms}>
          <div className="space-y-2">
            {profile.observedRoomTypes.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {labels.observedRooms}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {suitableRooms.map((room) => (
                <Badge key={room} variant="secondary" className="font-normal">
                  {room}
                </Badge>
              ))}
            </div>
          </div>
        </SpecRow>

        <SpecRow label={labels.bestFor}>
          <ul className="space-y-1.5">
            {profile.bestFor.map((item) => (
              <li
                key={pickLocalized(item, locale)}
                className="flex items-start gap-2 text-muted-foreground"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {pickLocalized(item, locale)}
              </li>
            ))}
          </ul>
        </SpecRow>

        <SpecRow label={labels.care}>
          <ul className="space-y-1.5 text-muted-foreground">
            {profile.care.map((item) => (
              <li key={pickLocalized(item, locale)}>
                {pickLocalized(item, locale)}
              </li>
            ))}
          </ul>
        </SpecRow>
      </dl>
    </section>
  );
}
