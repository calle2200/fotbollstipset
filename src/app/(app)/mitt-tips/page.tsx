import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";
import { MatchPicker } from "@/components/tips/MatchPicker";
import { GroupOrder } from "@/components/tips/GroupOrder";
import { SpecialPicks } from "@/components/tips/SpecialPicks";
import { SaveStatus } from "@/components/tips/SaveStatus";
import { matches, teams } from "@/lib/mock/data";

export default function MittTipsPage() {
  const groupMatches = matches.filter((m) => m.stage === "group");
  const groups = [...new Set(teams.map((t) => t.group))];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mitt tips"
        subtitle="Fas 1 — gruppmatcher, gruppplaceringar och specialval. Låses vid turneringsstart."
        action={<SaveStatus />}
      />

      <StubNotice>
        Dina tips sparas lokalt i webbläsaren så du kan klicka runt och komma
        tillbaka. Riktig lagring per konto, låsning vid deadline och
        poängberäkning kopplas på med Supabase i nästa session.
      </StubNotice>

      {/* Gruppmatcher */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Gruppmatcher</h2>
          <Badge tone="muted">{groupMatches.length} matcher</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {groupMatches.map((m) => (
            <MatchPicker key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* Gruppplaceringar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Gruppplaceringar</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <GroupOrder key={g} group={g} />
          ))}
        </div>
      </section>

      {/* Specialval */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Specialval</h2>
          <Badge tone="gold">Max 620 p</Badge>
        </div>
        <SpecialPicks />
      </section>
    </div>
  );
}
