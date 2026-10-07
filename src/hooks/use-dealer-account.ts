import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { fetchMyDealerAccount } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { DealerAccountDto } from "@/services/dealer-account.service";

export const dealerAccountQueryKey = (userId: string | undefined) =>
  ["dealer-account", userId] as const;

/** Only dealers have a dealer account; other users never trigger the request. */
export function useDealerAccount() {
  const { user, session, roles, loading } = useAuth();
  const hasDealerRole = roles.includes("dealer");

  return useQuery({
    queryKey: dealerAccountQueryKey(user?.id),
    enabled: !loading && hasDealerRole && Boolean(session?.access_token),
    staleTime: 5 * 60_000,
    queryFn: async () =>
      (await fetchMyDealerAccount(
        authServerFnOptions(session),
      )) as DealerAccountDto | null,
  });
}
