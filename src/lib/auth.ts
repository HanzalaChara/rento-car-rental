import { getSupabase, supabaseEnabled } from "./supabase";

/**
 * Admin authentication.
 * • Supabase mode: email + password sign-in (your Supabase account email).
 * • Demo mode: shared passcode, stored locally on the device.
 */
const DEMO_PASSCODE_KEY = "rento.demo.unlocked";
export const DEMO_PASSCODE = "rento2026";

export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, error: "Supabase is not configured — running in demo mode." };
  }
  const { error } = await sb.auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  localStorage.removeItem(DEMO_PASSCODE_KEY);
}

export function isAdminUnlocked(): boolean {
  if (supabaseEnabled) {
    return getSupabase()?.auth.getSession() !== null;
  }
  return localStorage.getItem(DEMO_PASSCODE_KEY) === "1";
}

export function unlockDemo(passcode: string): boolean {
  if (passcode === DEMO_PASSCODE) {
    localStorage.setItem(DEMO_PASSCODE_KEY, "1");
    return true;
  }
  return false;
}

export function authMode(): "supabase" | "demo" {
  return supabaseEnabled ? "supabase" : "demo";
}
