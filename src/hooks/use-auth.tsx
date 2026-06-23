import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { APP_PUBLIC_URL } from "@/lib/erp-config";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_ROLES, DEALER_ROLES, hasAnyRole } from "@/types/api/profile";

type AuthState = {
  user: User | null;
  session: Session | null;
  roles: string[];
  loading: boolean;
  isAdmin: boolean;
  isDealer: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function loadRoles(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist"))
      return ["retail_customer"];
    console.warn("[auth] loadRoles:", error.message);
    return ["retail_customer"];
  }
  const roles = (data ?? []).map((r) => r.role as string);
  return roles.length ? roles : ["retail_customer"];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const currentUser = data.session?.user ?? null;
    setSession(data.session);
    setUser(currentUser);
    if (currentUser) {
      setRoles(await loadRoles(currentUser.id));
    } else {
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    void refreshProfile().finally(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        if (nextSession?.user) {
          setRoles(await loadRoles(nextSession.user.id));
        } else {
          setRoles([]);
        }
      },
    );

    return () => sub.subscription.unsubscribe();
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const redirectTo = APP_PUBLIC_URL
        ? `${APP_PUBLIC_URL}/auth/callback`
        : undefined;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { full_name: fullName },
        },
      });
      if (error) throw new Error(error.message);
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = APP_PUBLIC_URL
      ? `${APP_PUBLIC_URL}/auth/callback`
      : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      roles,
      loading,
      isAdmin: hasAnyRole(roles, ADMIN_ROLES),
      isDealer: hasAnyRole(roles, DEALER_ROLES),
      refreshProfile,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [
      user,
      session,
      roles,
      loading,
      refreshProfile,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
