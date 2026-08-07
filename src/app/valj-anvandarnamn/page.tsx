import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { UsernameForm } from "@/components/auth/UsernameForm";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Välj användarnamn — Pick'em",
};

/** Föreslå ett giltigt namn utifrån mejladressen. */
function suggestFrom(email: string | undefined): string {
  const base = (email ?? "").split("@")[0] ?? "";
  const cleaned = base.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
  return /^[a-zA-Z]/.test(cleaned) ? cleaned : "";
}

export default async function ValjAnvandarnamnPage() {
  const user = await getCurrentUser();

  // Inte inloggad? Då hör man hemma på startsidan.
  if (!user) redirect("/#logga-in");

  // Har man redan ett namn behövs ingen onboarding.
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username) redirect("/turneringar");

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <Logo href="/valj-anvandarnamn" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-6 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-3xl">
            👋
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Välkommen!
          </h1>
          <p className="mt-2 text-muted">
            Välj ett användarnamn så vet vännerna vem som toppar listan.
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface/80 p-6 backdrop-blur-sm">
          <UsernameForm suggestion={suggestFrom(user.email)} />
        </div>

        <p className="mt-4 text-center text-xs text-faint">
          Inloggad som {user.email}
        </p>
      </main>
    </div>
  );
}
