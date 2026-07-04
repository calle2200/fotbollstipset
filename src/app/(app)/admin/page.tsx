import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StubNotice } from "@/components/ui/StubNotice";
import { matches, specialPicks } from "@/lib/mock/data";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin"
        subtitle="Hantera turnering, fyll i specialutfall och mata in reservresultat."
        action={<Badge tone="live">Endast admin</Badge>}
      />

      <StubNotice>
        Adminpanelen är enbart UI just nu. Åtkomstkontroll (endast admins),
        specialutfall som triggar poäng och manuell reservinmatning byggs i en
        senare session.
      </StubNotice>

      {/* Turneringsstatus */}
      <Card>
        <CardHeader title="Turnering" subtitle="VM 2026" action={<Badge tone="mint">Aktiv</Badge>} />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
          {[
            { label: "Status", value: "Gruppspel" },
            { label: "Fas 1 låst", value: "Ja" },
            { label: "Nästa deadline", value: "R16 · 4 jul" },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-xs text-muted">{row.label}</p>
              <p className="font-semibold text-ink">{row.value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
          <Button disabled variant="secondary" size="sm">Synka från API</Button>
          <Button disabled variant="secondary" size="sm">Öppna nästa runda</Button>
          <Button disabled variant="outline" size="sm">Låsning &amp; deadlines</Button>
        </div>
      </Card>

      {/* Reservinmatning av resultat */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Reservinmatning — resultat</h2>
        <Card>
          <CardHeader title="Manuell resultatinmatning" subtitle="Används om API:t fallerar" />
          <ul className="divide-y divide-border">
            {matches.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex-1 truncate text-sm text-ink">
                  {m.home.flag} {m.home.code} <span className="text-faint">vs</span> {m.away.code} {m.away.flag}
                </span>
                <input
                  disabled
                  defaultValue={m.homeScore ?? ""}
                  placeholder="–"
                  className="h-9 w-10 rounded-lg border border-border bg-surface-2 text-center text-ink placeholder:text-faint"
                />
                <span className="text-faint">–</span>
                <input
                  disabled
                  defaultValue={m.awayScore ?? ""}
                  placeholder="–"
                  className="h-9 w-10 rounded-lg border border-border bg-surface-2 text-center text-ink placeholder:text-faint"
                />
                <Button disabled size="sm" variant="ghost">Spara</Button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Specialutfall */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Specialutfall</h2>
        <Card>
          <CardHeader title="Fyll i utfall" subtitle="Triggar poäng för alla specialval när det sätts" />
          <ul className="divide-y divide-border">
            {specialPicks.map((sp) => (
              <li key={sp.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="font-medium text-ink">{sp.label}</p>
                  <p className="text-xs text-faint">Max {sp.maxPoints} p</p>
                </div>
                <input
                  disabled
                  placeholder="Sätt utfall…"
                  className="h-9 w-40 rounded-lg border border-border bg-surface-2 px-3 text-sm text-ink placeholder:text-faint sm:w-56"
                />
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
