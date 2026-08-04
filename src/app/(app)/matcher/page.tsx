import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";
import { MatchCard } from "@/components/tips/MatchCard";
import { matches as mockMatches } from "@/lib/mock/data";
import { getMatches } from "@/lib/supabase/matches";

// Läs alltid färsk data från databasen vid varje besök.
export const dynamic = "force-dynamic";

export default async function MatcherPage() {
  // Hämta från Supabase; faller tillbaka på mockdata om databasen inte svarar.
  const matches = (await getMatches()) ?? mockMatches;

  const live = matches.filter((m) => m.status === "live");
  const finished = matches.filter((m) => m.status === "finished");
  const upcoming = matches.filter((m) => m.status === "scheduled");

  const sections = [
    { key: "live", title: "Pågår nu", items: live, tone: "live" as const },
    { key: "upcoming", title: "Kommande", items: upcoming, tone: "muted" as const },
    { key: "finished", title: "Spelade", items: finished, tone: "muted" as const },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Matcher & resultat"
        subtitle="Alla matcher i turneringen med resultat."
      />

      <StubNotice>
        Matcherna läses nu från databasen. Automatisk resultathämtning från
        football-data.org kopplas på i en senare session.
      </StubNotice>

      {sections.map((section) => (
        <section key={section.key} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
            <Badge tone={section.tone}>{section.items.length}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {section.items.map((m) => (
              <MatchCard key={m.id} match={m} variant="result" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
