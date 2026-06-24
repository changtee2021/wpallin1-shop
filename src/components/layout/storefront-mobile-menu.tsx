import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

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
  { to: "/shop", key: "nav.shop" as const },
  { to: "/configurator", key: "nav.configurator" as const },
  { to: "/about", key: "nav.about" as const },
  { to: "/contact", key: "nav.contact" as const },
];

export function StorefrontMobileMenu() {
  const { t } = useT();
  const { user, isAdmin, isDealer } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full lg:hidden"
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
              <>
                <Link
                  to="/account"
                  search={{ tab: "dashboard" }}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.account")}
                </Link>
                {isDealer ? (
                  <Link
                    to="/dealer"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.dealer")}
                  </Link>
                ) : null}
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.admin")}
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.signup")}
                </Link>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
