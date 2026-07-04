import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";

const features = [
  {
    title: "Tippa varje match",
    body: "1X2 + exakt resultat. Bonuspoäng ju närmare du är.",
    icon: "M9 11l3 3L22 4",
  },
  {
    title: "Specialval",
    body: "Skyttekung, turneringsvinnare, topp fyra och mer — värt storpoäng.",
    icon: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z",
  },
  {
    title: "Ligor & topplistor",
    body: "Skapa en liga, bjud in vänner med en kod och följ leaderboarden live.",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-full flex-col">
      {/* Toppbar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo href="/" />
        <ButtonLink href="/mitt-tips" variant="outline" size="sm">
          Logga in
        </ButtonLink>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 sm:px-6">
        <section className="flex flex-col items-center py-14 text-center sm:py-20">
          <Badge tone="brand" className="mb-5">
            ⚽ VM 2026 · tippa mot vännerna
          </Badge>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Tippa turneringen.
            <br />
            <span className="text-brand">Krossa</span> dina vänner.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Lägg ditt tips på varje match, gruppplaceringar och specialval.
            Samla poäng, klättra på topplistan och gör slutspelet till en tävling.
          </p>

          {/* Login-platshållare */}
          <div className="mt-9 w-full max-w-sm">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-sm">
              <label className="text-left text-sm font-medium text-muted">
                E-post (magic link)
              </label>
              <input
                type="email"
                disabled
                placeholder="du@example.com"
                className="h-11 rounded-xl border border-border bg-surface-2 px-4 text-ink placeholder:text-faint focus:outline-none"
              />
              <ButtonLink href="/mitt-tips" size="lg" className="w-full">
                Skicka inloggningslänk
              </ButtonLink>
              <p className="text-xs text-faint">
                Ingen riktig inloggning ännu — knappen tar dig rakt in i appen.
              </p>
            </div>
          </div>

          <div className="mt-6 w-full max-w-sm">
            <StubNotice>
              Magic link-inloggning via Supabase Auth kopplas in i en senare session.
            </StubNotice>
          </div>
        </section>

        {/* Feature-kort */}
        <section className="grid w-full gap-4 pb-20 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-[var(--radius-card)] border border-border bg-surface/70 p-6 backdrop-blur-sm"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </span>
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-faint">
        Pick'em · Platshållar-UI (v0.1) — byggd för avstämning
      </footer>
    </div>
  );
}
