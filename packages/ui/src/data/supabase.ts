import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Returns a browser Supabase client, or null when env is not configured (fixture mode).
 * Only the public anon key is ever read here; service-role keys must never carry the VITE_ prefix.
 */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const env = import.meta.env ?? {};
  const url = env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = env.VITE_SUPABASE_ANON_KEY as string | undefined;
  client = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
  return client;
}

export function isLive(): boolean {
  return getSupabase() !== null;
}
