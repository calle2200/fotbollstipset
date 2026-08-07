import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase-klient för serversidan (server-komponenter, route handlers).
 * Läser och skriver sessionen via cookies så inloggningen följer med mellan
 * sidladdningar.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Anropas från en server-komponent, där cookies inte får skrivas.
          // Går bra att ignorera — proxy.ts håller sessionen uppdaterad.
        }
      },
    },
  });
}

/**
 * Hämtar användarens profil (användarnamn m.m.), eller null.
 * Kastar aldrig — anroparen kan behandla null som "vet inte".
 */
export async function getProfile(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar, username_changed_at")
      .eq("id", userId)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

/** Hämtar inloggad användare, eller null. Kastar aldrig. */
export async function getCurrentUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}
