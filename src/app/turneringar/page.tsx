import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { Countdown } from "@/components/ui/Countdown";
import { BallIcon, TrophyIcon } from "@/components/ui/Football";
import { tournaments, currentUser } from "@/lib/mock/data";
import { getTournaments } from "@/lib/supabase/tournaments";
import { getCurrentUser } from "@/lib/supabase/server";

// Läs alltid färsk data från databasen vid varje besök.
export const dynamic = "force-dynamic";

function dateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function TurneringarPage() {
  // Hämta från Supabase; faller tillbaka på mockdata om databasen inte svarar.
  const list = (await getTournaments()) ?? tournaments;
  const user = await getCurrentUser();
  // Visa den del av mejlen som står före @ som visningsnamn tills profiler finns.
  const greetingName = user?.email?.split("@")[0] ?? currentUser.displayName;

  return (
    <div className="flex min-h-full flex-col">
      {/* Enkel toppbar */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Logo href="/turneringar" />
          <Link
            href="/profil"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-2 text-sm font-bold text-ink transition-colors hover:border-brand/40"
            aria-label="Profil"
          >
            {user?.email ? user.email[0]!.toUpperCase() : currentUser.avatar}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted">Hej {greetingName} 👋</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Välj turnering
          </h1>
          <p className="mt-2 max-w-xl text-muted">
            Öppna en turnering för att lägga ditt tips, se matcher och följa
            topplistan.
          </p>
        </div>

        <div className="grid gap-4">
          {list.map((tour) => (
            <Link
              key={tour.id}
              href="/mitt-tips"
              className="group relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface/80 p-6 backdrop-blur-sm transition-colors hover:border-brand/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                    <TrophyIcon className="h-7 w-7" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-ink">{tour.name}</h2>
                      <Badge tone="brand">Öppen för tips</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">{tour.host}</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                      <span>
                        <span className="text-faint">Start:</span> {dateLabel(tour.startsAt)}
                      </span>
                      <span>
                        <span className="text-faint">Lag:</span> {tour.teamCount}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition-all group-hover:bg-brand group-hover:text-[#08120b]">
                  →
                </span>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
                  Avspark om
                </p>
                <Countdown target={tour.startsAt} variant="cards" />
              </div>
            </Link>
          ))}

          {/* Platshållare för framtida turneringar */}
          <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-border bg-surface/30 p-6 text-muted">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-faint">
              <BallIcon className="h-7 w-7" />
            </span>
            <div>
              <h2 className="font-semibold text-muted">Fler turneringar kommer</h2>
              <p className="text-sm text-faint">
                Just nu finns EM 2028. VM 2030 och fler dyker upp här senare.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-faint">
          Inloggning och riktiga turneringar kopplas på med Supabase i en senare
          session. Just nu tar valet dig rakt in i EM 2028.
        </p>
      </main>
    </div>
  );
}
