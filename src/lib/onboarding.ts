import { supabase } from "@/integrations/supabase/client";

export const ONBOARDING_KEY = "bb_onboarded_v1";
export const AUTH_KEY = "bb_user_v1";

export const isOnboarded = () => {
  try { return localStorage.getItem(ONBOARDING_KEY) === "1"; } catch { return false; }
};

export const setOnboarded = () => {
  try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
};

export const saveOnboardingStep = (key: string, value: unknown) => {
  try { localStorage.setItem(`bb_ob_${key}`, JSON.stringify(value)); } catch {}
};

/** Legacy local marker; real auth state comes from supabase.auth */
export const isAuthed = () => {
  try { return !!localStorage.getItem(AUTH_KEY); } catch { return false; }
};
export const setAuthed = (id: string, extra?: Record<string, unknown>) => {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify({ id, ts: Date.now(), ...extra })); } catch {}
};
export const clearAuthed = () => {
  try { localStorage.removeItem(AUTH_KEY); } catch {}
};

/** Send an SMS one-time-password to the given E.164 phone. */
export async function signInWithPhone(phone: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to send code" };
  }
}

/** Verify the 6-digit OTP and complete sign in. */
export async function verifyPhoneOtp(phone: string, token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
    if (error) return { ok: false, error: error.message };
    setAuthed(data.user?.id || "", { phone });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Verification failed" };
  }
}

export async function signOut() {
  try { await supabase.auth.signOut(); } catch {}
  clearAuthed();
}
