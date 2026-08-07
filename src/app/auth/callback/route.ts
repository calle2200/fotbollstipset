import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Tar emot användaren efter klick på inloggningslänken i mejlet.
 * Byter engångskoden mot en session och skickar vidare in i appen.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/turneringar";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Nya användare saknar användarnamn — skicka dem till onboarding först.
      const userId = data.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .maybeSingle();
        if (!profile?.username) {
          return NextResponse.redirect(`${origin}/valj-anvandarnamn`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Ogiltig eller utgången länk.
  return NextResponse.redirect(`${origin}/?fel=inloggning`);
}
