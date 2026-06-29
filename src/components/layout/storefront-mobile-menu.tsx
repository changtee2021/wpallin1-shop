import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { AccountMenuButton } from "@/components/account/account-menu-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";

const storeLinks = [
  { to: "/", key: "nav.home" as const },
  { to: "/shop", key: "nav.shop" as const },
  { to: "/catalogs", key: "nav.catalogs" as const },
  { to: "/configurator", key: "nav.configurator" as const },
  { to: "/about", key: "nav.about" as const },
  { to: "/contact", key: "nav.contact" as const },
];

export function StorefrontMobileMenu({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const { t } = useT();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full lg:hidden ${triggerClassName ?? ""}`}
        onClick={() => setOpen(true)}
        aria-label="Menu"
      >
        <Menu className="size-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px]">
          <SheetHeader>
            <SheetTitle>{t("nav.menu") ?? "เมนู"}</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1">
            {storeLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            {user ? (
              <AccountMenuButton
                variant="menu"
                className="mt-2"
                onNavigate={() => setOpen(false)}
              />
            ) : (
              <Link
                to="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {t("nav.login")}
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
