import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm";

const config = window.TATTOO_APP_CONFIG || {};
export const supabaseConfigured =
  Boolean(config.SUPABASE_URL) &&
  Boolean(config.SUPABASE_PUBLISHABLE_KEY) &&
  !config.SUPABASE_URL.includes("PASTE_") &&
  !config.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");

export const supabase = supabaseConfigured
  ? createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

export const studioSlug = config.STUDIO_SLUG || "demo";