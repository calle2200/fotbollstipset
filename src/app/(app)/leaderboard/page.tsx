import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";
import { getCurrentUser } from "@/lib/supabase/server";
import { getLeaderboard } from "@/lib/supabase/leagues";
import { getMatches } from "@/lib/supabase/matches";
import { matches as mockMatches } from "@/lib/mock/data";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  const [rows, dbMatches] = await Promise.all([getLeaderboard(), getMatches()]);
  const totalMatches = (dbMatches ?? mockMatches).length;

  const myRank = user ? rows.findIndex((r) => r.userId === user.id) + 1 : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Global leaderboard"
        subtitle="Alla spelare i turneringen."
        action={
          myRank > 0 ? (
            <Badge tone="brand">Du är med</Badge>
          ) : (
            <Badge tone="muted">{rows.length} spelare</Badge>
          )
        }
      />

      <StubNotice>
        Poängkolumnen fylls när poängmotorn är byggd — då rankas listan på total
        poäng. Tills dess visas hur många matchtips varje spelare lagt.
      </StubNotice>

      {rows.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface/40 px-5 py-10 text-center">
          <p className="text-4xl">🏟️</p>
          <p className="mt-3 font-medium text-ink">Inga spelare än</p>
          <p className="mt-1 text-sm text-muted">
            Den som registrerar sig och väljer användarnamn dyker upp här.
          </p>
        </div>
      ) : (
        <Card>
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-faint">
            <span>#</span>
            <span>Spelare</span>
            <span className="text-right">Tips</span>
            <span className="text-right">Poäng</span>
          </div>
          <ul className="divide-y divide-border">
            {rows.map((row, i) => {
              const isMe = row.userId === user?.id;
              const done = totalMatches > 0 && row.tipsCount >= totalMatches;
              return (
                <li
                  key={row.userId}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-5 py-3",
                    isMe && "bg-brand/[0.06]",
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold text-muted">
                    {i + 1}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "truncate font-medium",
                        isMe ? "text-brand" : "text-ink",
                      )}
                    >
                      @{row.username}
                    </span>
                    {isMe && (
                      <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                        DU
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-right text-sm tabular-nums",
                      done ? "text-mint" : "text-muted",
                    )}
                    title={`${row.tipsCount} av ${totalMatches} matcher tippade`}
                  >
                    {row.tipsCount}/{totalMatches}
                  </span>
                  <span className="text-right font-bold tabular-nums text-faint">—</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
