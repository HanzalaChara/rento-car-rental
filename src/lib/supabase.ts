import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is optional in development: without keys the site runs in
 * demo mode (localStorage). In production, set these env vars — see README.
 */
const env = import.meta.env;

export const SUPABASE_URL: string | undefined = env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY: string | undefined = env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!client) client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return client;
}
