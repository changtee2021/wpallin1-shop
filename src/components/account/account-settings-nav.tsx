import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export const SETTINGS_SECTIONS = [
  { id: "personal", label: "ข้อมูลส่วนตัว" },
  { id: "finance", label: "การเงิน" },
  { id: "address-tax", label: "ที่อยู่และภาษี" },
  { id: "system", label: "ระบบ" },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

type AccountSettingsNavProps = {
  activeSection: SettingsSectionId;
  className?: string;
};

export function AccountSettingsNav({
  activeSection,
  className,
}: AccountSettingsNavProps) {
  return (
    <nav
      className={cn(
        "flex gap-1 overflow-x-auto border-b [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {SETTINGS_SECTIONS.map((section) => {
        const active = activeSection === section.id;
        return (
          <Link
            key={section.id}
            to="/account"
            search={{ tab: "settings", section: section.id }}
            preload={false}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
