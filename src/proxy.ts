import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (hette Middleware före Next.js 16).
 *
 * Kör före varje sidladdning och förnyar Supabase-sessionen så att man inte
 * blir utloggad i onödan. Den gatear ingenting ännu — alla sidor är fortfarande
 * öppna. Inloggningskrav lägger vi på senare, när tipsen flyttas till databasen.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Utan nycklar (t.ex. innan de lagts in på Vercel) gör vi ingenting.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Att hämta användaren är det som triggar en ev. token-förnyelse.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Hoppa över statiska filer och bilder.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
