import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { BallIcon, TrophyIcon, WhistleIcon, PitchMarkings } from "@/components/ui/Football";

const features = [
  {
    title: "Tippa varje match",
    body: "1X2 + exakt resultat. Bonuspoäng ju närmare du är.",
    Icon: BallIcon,
    accent: "text-cyan",
    ring: "bg-cyan/15",
  },
  {
    title: "Specialval",
    body: "Skyttekung, turneringsvinnare, topp fyra och mer — värt storpoäng.",
    Icon: TrophyIcon,
    accent: "text-violet",
    ring: "bg-violet/15",
  },
  {
    title: "Ligor & topplistor",
    body: "Skapa en liga, bjud in vänner med en kod och följ leaderboarden live.",
    Icon: WhistleIcon,
    accent: "text-orange",
    ring: "bg-orange/15",
  },
];

// Liten poäng-överblick i hero (matchar poängsystemet i GDD:n)
const scoring = [
  { label: "Rätt 1X2", value: "10 p", tone: "text-brand" },
  { label: "Exakt resultat", value: "+10 p", tone: "text-cyan" },
  { label: "Turneringsvinnare", value: "100 p", tone: "text-violet" },
  { label: "Topp fyra", value: "240 p", tone: "text-orange" },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-full flex-col">
      {/* Toppbar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo href="/" />
        <div className="flex items-center gap-2">
          <Link
            href="/regler"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Regler
          </Link>
          <ButtonLink href="/#logga-in" variant="outline" size="sm">
            Logga in
          </ButtonLink>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 sm:px-6">
        <section className="flex flex-col items-center py-14 text-center sm:py-20">
          <Badge tone="brand" className="mb-5">
            ⚽ EM 2028 · tippa mot vännerna
          </Badge>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Tippa turneringen.
            <br />
            <span className="bg-gradient-to-r from-pink via-brand to-cyan bg-clip-text text-transparent">
              Krossa
            </span>{" "}
            dina vänner.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Lägg ditt tips på varje match, gruppplaceringar och specialval.
            Samla poäng, klättra på topplistan och gör slutspelet till en tävling.
          </p>

          {/* Poäng-överblick */}
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {scoring.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-sm backdrop-blur-sm"
              >
                <span className="text-muted">{s.label}</span>
                <span className={`font-bold ${s.tone}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Inloggning via magic link */}
          <div id="logga-in" className="mt-9 w-full max-w-sm scroll-mt-24">
            <MagicLinkForm />

            {/* Gästläge — så man kan titta runt utan konto */}
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-wide text-faint">
                eller
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Link
              href="/turneringar"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/50 hover:text-brand"
            >
              👀 Titta runt som gäst
            </Link>
            <p className="mt-2 text-xs text-faint">
              Utforska hela appen utan konto — dina tips sparas bara i den här
              webbläsaren.
            </p>
          </div>
        </section>

        {/* Plan-markering som avdelare */}
        <div className="relative flex w-full items-center justify-center py-2">
          <PitchMarkings className="h-16 w-full max-w-lg text-brand/20" />
        </div>

        {/* Feature-kort */}
        <section className="grid w-full gap-4 pb-20 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-[var(--radius-card)] border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-border/80"
            >
              <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.ring} ${f.accent}`}>
                <f.Icon className="h-6 w-6" />
              </span>
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="field-stripes border-t border-border py-6 text-center text-sm text-faint">
        Pick'em · Platshållar-UI (v0.1) — byggd för avstämning
      </footer>
    </div>
  );
}
