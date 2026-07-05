import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { globalLeaderboard, currentUser } from "@/lib/mock/data";

export default function LeaderboardPage() {
  const podium = globalLeaderboard.slice(0, 3);
  // Ordning på pallen: 2:a, 1:a, 3:a
  const podiumOrder = [podium[1], podium[0], podium[2]];
  const heights = ["h-20", "h-28", "h-16"];
  // Färg per plats i pall-ordningen (2:a cyan, 1:a guld, 3:a lila)
  const podiumBar = ["bg-cyan/15", "bg-gold/20", "bg-violet/15"];
  const podiumText = ["text-cyan", "text-gold", "text-violet"];
  const podiumEmoji = ["🥈", "🏆", "🥉"];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Global leaderboard"
        subtitle="Alla spelare i turneringen, rankade på total poäng."
        action={<Badge tone="brand">Din placering: #{currentUser.globalRank}</Badge>}
      />

      <StubNotice>
        Topplistan uppdateras i realtid via Supabase Realtime när poängmotorn är
        på plats. Nu visas mockade poäng.
      </StubNotice>

      {/* Pall */}
      <div className="grid grid-cols-3 items-end gap-3 sm:mx-auto sm:max-w-md">
        {podiumOrder.map((row, i) => (
          <div key={row.username} className="flex flex-col items-center">
            <span className="mb-2 text-2xl">{podiumEmoji[i]}</span>
            <span className="mb-1 max-w-full truncate text-sm font-semibold text-ink">
              {row.username}
            </span>
            <span className="mb-2 text-xs text-muted">{row.points.toLocaleString("sv-SE")} p</span>
            <div
              className={`${heights[i]} ${podiumBar[i]} flex w-full items-start justify-center rounded-t-xl border border-b-0 border-border pt-2`}
            >
              <span className={`text-lg font-black ${podiumText[i]}`}>{row.rank}</span>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <LeaderboardTable rows={globalLeaderboard} />
      </Card>
    </div>
  );
}
