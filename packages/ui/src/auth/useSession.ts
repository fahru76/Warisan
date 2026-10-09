import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "../data/supabase";
import type { AppRole, Profile } from "../data/types";

export function useSession() {
  const sb = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(sb));

  useEffect(() => {
    if (!sb) return;
    void sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = sb.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  return { session, user: session?.user ?? null, loading, live: Boolean(sb) };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("profiles").select("id,role,display_name,pdpa_consent_date,marketing_opt_in").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

/**
 * Domain role gate. Warisan.org accepts artisans + admins; Warisan.net accepts customers
 * (artisans/admins may also shop). RLS is the real boundary — this only keeps the UI honest.
 */
export const DOMAIN_ROLES: Record<"org" | "net", AppRole[]> = {
  org: ["artisan", "admin"],
  net: ["customer", "artisan", "admin"]
};

export async function signInWithPassword(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  pdpaConsent: boolean;
  marketingOptIn: boolean;
  applyingAs: "customer" | "artisan";
  craftSpecialty?: string;
  location?: string;
}

/**
 * Registration metadata is carried in raw_user_meta_data. The server trigger (ticket H-11) stamps
 * pdpa_consent_date = now() when pdpa_consent is true, so the timestamp is server-trusted.
 */
export async function signUp(input: SignUpInput, emailRedirectTo?: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured");
  if (!input.pdpaConsent) throw new Error("PDPA consent is required");
  const { data, error } = await sb.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo,
      data: {
        display_name: input.displayName,
        pdpa_consent: true,
        marketing_opt_in: input.marketingOptIn,
        applying_as: input.applyingAs,
        craft_specialty: input.craftSpecialty ?? null,
        location: input.location ?? null
      }
    }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}
