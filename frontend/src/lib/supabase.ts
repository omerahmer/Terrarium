import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Auth/cloud projects are optional: when the Supabase env vars aren't set the
// app still runs fully on localStorage (anonymous mode). `supabase` is null in
// that case, and callers (useAuth, projects.ts) treat it as "not configured".
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
