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
import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isCreator: boolean;
  isClient: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    role: AppRole;
  }) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAccount = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setRole(null);
      return;
    }
    const [{ data: profileRow }, { data: roleRow }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    ]);
    setProfile(profileRow ?? null);
    setRole((roleRow?.role as AppRole | undefined) ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      // Defer Supabase calls out of the auth callback.
      setTimeout(() => {
        void loadAccount(nextSession?.user?.id);
      }, 0);
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await loadAccount(data.session?.user?.id);
      setLoading(false);
    })();

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadAccount]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async ({ email, password, fullName, role: nextRole }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/marketplace`,
          data: { full_name: fullName, role: nextRole },
        },
      });
      if (error) throw error;
      return { requiresEmailConfirmation: !data.session };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      role,
      loading,
      isCreator: role === "creator",
      isClient: role === "client",
      signIn,
      signUp,
      signOut,
    }),
    [user, session, profile, role, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
