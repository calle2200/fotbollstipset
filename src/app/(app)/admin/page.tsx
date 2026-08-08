import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StubNotice } from "@/components/ui/StubNotice";
import { SettleMatchForm } from "@/components/admin/SettleMatchForm";
import { getCurrentUser, isCurrentUserAdmin } from "@/lib/supabase/server";
import { getMatches } from "@/lib/supabase/matches";
import { matches as mockMatches, specialPicks, activeTournament } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const isAdmin = await isCurrentUserAdmin();

  // Sidan är låst — men behörigheten kontrolleras även inne i server-funktionen
  // som faktiskt delar ut poäng, eftersom den går att nå direkt via POST.
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin" />
        <Card className="p-8 text-center">
          <p className="text-4xl">🔒</p>
          <h2 className="mt-3 text-lg font-semibold text-ink">Endast för administratörer</h2>
          <p className="mt-1 text-muted">
            {user
              ? "Ditt konto har inte adminbehörighet."
              : "Logga in med ett adminkonto för att komma åt den här sidan."}
          </p>
        </Card>
      </div>
    );
  }

  const matches = (await getMatches()) ?? mockMatches;
  const settled = matches.filter((m) => m.status === "finished").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin"
        subtitle="Mata in resultat, räkna poäng och fyll i specialutfall."
        action={<Badge tone="brand">Admin</Badge>}
      />

      {/* Turneringsstatus */}
      <Card>
        <CardHeader
          title="Turnering"
          subtitle={activeTournament.name}
          action={<Badge tone="mint">Aktiv</Badge>}
        />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
          {[
            { label: "Matcher", value: String(matches.length) },
            { label: "Avgjorda", value: `${settled} av ${matches.length}` },
            { label: "Nästa deadline", value: "Vid avspark" },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-xs text-muted">{row.label}</p>
              <p className="font-semibold text-ink">{row.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Resultat + poängberäkning */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Resultat &amp; poäng</h2>
        <Card>
          <CardHeader
            title="Mata in resultat"
            subtitle="Poängen räknas ut direkt när du sparar."
          />
          <ul className="divide-y divide-border">
            {matches.map((m) => (
              <SettleMatchForm key={m.id} match={m} />
            ))}
          </ul>
        </Card>
        <p className="text-xs text-faint">
          Multiplikatorerna fryses första gången en match avgörs och återanvänds
          vid omräkning — så ställningen ändras aldrig retroaktivt när nya
          spelare tillkommer.
        </p>
      </section>

      {/* Specialutfall */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Specialutfall</h2>
        <StubNotice>
          Specialvalen (vinnare, skyttekung m.m.) poängsätts i nästa steg — de
          avgörs bara en gång, i slutet av turneringen.
        </StubNotice>
        <Card>
          <ul className="divide-y divide-border">
            {specialPicks.map((sp) => (
              <li key={sp.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="font-medium text-ink">{sp.label}</p>
                  <p className="text-xs text-faint">Max {sp.maxPoints} p</p>
                </div>
                <Button disabled size="sm" variant="ghost">
                  Sätt utfall
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
