import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { PageLoading } from "@/components/loading";
import { useAuth } from "@/hooks/use-auth";
import { safeAuthRedirect } from "@/lib/auth-errors";

type RequireAuthGateProps = {
  children: ReactNode;
  /** When set, user must have dealer role. */
  requireDealer?: boolean;
  /** When set, user must have admin role. */
  requireAdmin?: boolean;
  /** Shell shown while auth/roles resolve — keeps header visible when provided. */
  loadingShell?: ReactNode;
};

export function RequireAuthGate({
  children,
  requireDealer = false,
  requireAdmin = false,
  loadingShell,
}: RequireAuthGateProps) {
  const navigate = useNavigate();
  const { user, loading, isDealer, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const redirect =
        typeof window !== "undefined"
          ? safeAuthRedirect(
              `${window.location.pathname}${window.location.search}`,
            )
          : undefined;
      void navigate({
        to: "/login",
        search: redirect && redirect !== "/login" ? { redirect } : undefined,
        replace: true,
      });
      return;
    }

    if (requireDealer && !isDealer) {
      void navigate({ to: "/account", replace: true });
      return;
    }

    if (requireAdmin && !isAdmin) {
      void navigate({ to: "/account", replace: true });
    }
  }, [loading, user, isDealer, isAdmin, requireDealer, requireAdmin, navigate]);

  if (loading) {
    return loadingShell ?? <PageLoading variant="default" className="min-h-screen" />;
  }

  if (!user) return null;
  if (requireDealer && !isDealer) return null;
  if (requireAdmin && !isAdmin) return null;

  return children;
}
