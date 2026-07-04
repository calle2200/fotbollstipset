import type { LeaderRow } from "@/lib/mock/data";
import { cn } from "@/lib/cn";

function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1 ? "bg-gold/20 text-gold" : rank <= 3 ? "bg-mint/15 text-mint" : "bg-surface-2 text-muted";
  return (
    <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold", medal)}>
      {rank}
    </span>
  );
}

function Delta({ delta }: { delta?: number }) {
  if (delta == null || delta === 0)
    return <span className="text-faint">–</span>;
  const up = delta > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", up ? "text-brand" : "text-red-400")}>
      {up ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}

export function LeaderboardTable({ rows }: { rows: LeaderRow[] }) {
  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-faint">
        <span>#</span>
        <span>Spelare</span>
        <span className="text-right">+/–</span>
        <span className="text-right">Poäng</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li
            key={row.rank}
            className={cn(
              "grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-5 py-3",
              row.isMe && "bg-brand/[0.06]",
            )}
          >
            <RankBadge rank={row.rank} />
            <span className="flex items-center gap-2 truncate">
              <span className={cn("truncate font-medium", row.isMe ? "text-brand" : "text-ink")}>
                {row.username}
              </span>
              {row.isMe && (
                <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                  DU
                </span>
              )}
            </span>
            <span className="text-right">
              <Delta delta={row.delta} />
            </span>
            <span className="text-right font-bold tabular-nums text-ink">
              {row.points.toLocaleString("sv-SE")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
