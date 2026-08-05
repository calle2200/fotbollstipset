"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase-klient för webbläsaren. Används av inloggningsformuläret och
 * annat som körs på klientsidan.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
