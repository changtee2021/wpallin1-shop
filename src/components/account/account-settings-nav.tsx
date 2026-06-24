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
  orientation?: "vertical" | "horizontal";
};

export function AccountSettingsNav({
  activeSection,
  className,
  orientation = "vertical",
}: AccountSettingsNavProps) {
  return (
    <nav
      className={cn(
        orientation === "horizontal"
          ? "flex gap-1 overflow-x-auto"
          : "space-y-1",
        className,
      )}
    >
      {SETTINGS_SECTIONS.map((section) => (
        <Link
          key={section.id}
          to="/account"
          search={{ tab: "settings", section: section.id }}
          preload={false}
          className={cn(
            "rounded-lg px-3 py-2 text-sm transition-colors",
            orientation === "horizontal" && "shrink-0 whitespace-nowrap",
            orientation === "vertical" && "block",
            activeSection === section.id
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
