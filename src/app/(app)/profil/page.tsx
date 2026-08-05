import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { StubNotice } from "@/components/ui/StubNotice";
import { specialPicks, leagues, currentUser } from "@/lib/mock/data";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/60 px-4 py-3">
      <p className={`text-2xl font-bold tabular-nums ${tone ?? "text-ink"}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export default async function ProfilPage() {
  const hitRate = Math.round((currentUser.correctPicks / currentUser.totalPicks) * 100);
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profil"
        action={
          user ? (
            <form action="/auth/sign-out" method="post">
              <Button type="submit" variant="outline">
                Logga ut
              </Button>
            </form>
          ) : (
            <ButtonLink href="/#logga-in" variant="outline">
              Logga in
            </ButtonLink>
          )
        }
      />

      {/* Inloggningsstatus */}
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          user
            ? "border-brand/40 bg-brand/10 text-ink"
            : "border-border bg-surface-2/50 text-muted"
        }`}
      >
        {user ? (
          <>
            ✅ Inloggad som <span className="font-semibold">{user.email}</span>
          </>
        ) : (
          <>Inte inloggad — profilen nedan visar exempeldata.</>
        )}
      </div>

      {/* Profilkort */}
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/15 text-4xl">
            {currentUser.avatar}
          </span>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-ink">{currentUser.displayName}</h2>
            <p className="font-mono text-sm text-muted">@{currentUser.username}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge tone="brand">#{currentUser.globalRank} globalt</Badge>
              <Badge tone="muted">{currentUser.leaguesCount} ligor</Badge>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total poäng" value={currentUser.totalPoints.toLocaleString("sv-SE")} tone="text-brand" />
          <Stat label="Rätt tips" value={`${currentUser.correctPicks}/${currentUser.totalPicks}`} />
          <Stat label="Träffsäkerhet" value={`${hitRate}%`} />
          <Stat label="Global placering" value={`#${currentUser.globalRank}`} />
        </div>
      </Card>

      <StubNotice>
        Inloggning och utloggning fungerar. Användarnamn, avatar och statistiken
        ovan är fortfarande exempeldata — de kopplas till ditt konto när tipsen
        flyttas till databasen.
      </StubNotice>

      {/* Mina specialval */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Mina specialval</h2>
        <Card>
          <ul className="divide-y divide-border">
            {specialPicks.map((sp) => (
              <li key={sp.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-ink">{sp.label}</p>
                  <p className="text-sm text-muted">{sp.choice}</p>
                </div>
                {sp.locked && <Badge tone="muted">🔒 Låst</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Mina ligor */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Mina ligor</h2>
        <Card>
          <ul className="divide-y divide-border">
            {leagues.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-5 py-3">
                <span className="font-medium text-ink">{l.name}</span>
                <span className="text-sm text-muted">
                  Placering <span className="font-bold text-brand">#{l.myRank}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
