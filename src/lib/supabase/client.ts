import { createClient } from "@supabase/supabase-js";

/**
 * Supabase-klient för webbläsaren.
 *
 * Använder anon/public-nyckeln, som är säker att exponera så länge Row-Level
 * Security (RLS) är på i databasen. Nycklarna läses från miljövariabler
 * (.env.local lokalt, Vercel Environment Variables i produktion).
 *
 * TODO (senare): när vi bygger inloggning lägger vi till server-side klienter
 * via @supabase/ssr. Den här räcker för att läsa publik data och testa kopplingen.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Saknar Supabase-miljövariabler. Fyll i NEXT_PUBLIC_SUPABASE_URL och " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY i .env.local.",
  );
}

export const supabase = createClient(url, anonKey);
