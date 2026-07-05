"use client";

import type { Match } from "@/lib/mock/data";
import { Badge, LiveDot } from "@/components/ui/Badge";
import { groupColor } from "@/lib/groupColors";
import { usePredictions } from "@/lib/predictions/store";
import { cn } from "@/lib/cn";

function kickoffLabel(iso: string) {
  return new Date(iso).toLocaleString("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Stepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-border bg-surface-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="flex h-9 w-8 items-center justify-center text-muted transition-colors hover:bg-border hover:text-ink"
        aria-label={`Minska ${label}`}
      >
        –
      </button>
      <span className="flex h-9 w-9 items-center justify-center text-lg font-bold tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-9 w-8 items-center justify-center text-muted transition-colors hover:bg-border hover:text-ink"
        aria-label={`Öka ${label}`}
      >
        +
      </button>
    </div>
  );
}

/** Redigerbart matchtips — 1X2 härleds av valt resultat. */
export function MatchPicker({ match }: { match: Match }) {
  const { scores, setScore } = usePredictions();
  const score = scores[match.id] ?? { home: 0, away: 0 };

  const sign = Math.sign(score.home - score.away);
  const outcome = sign > 0 ? "1" : sign < 0 ? "2" : "X";
  const outcomeTone = sign > 0 ? "text-brand" : sign < 0 ? "text-cyan" : "text-muted";

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface/80 p-4 backdrop-blur-sm transition-colors hover:border-border/70">
      <div className="mb-3 flex items-center justify-between text-xs text-faint">
        <span>{kickoffLabel(match.kickoff)}</span>
        {match.status === "live" ? (
          <Badge tone="live">
            <LiveDot /> Live
          </Badge>
        ) : match.group ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
              groupColor(match.group).bg,
              groupColor(match.group).text,
            )}
          >
            Grupp {match.group}
          </span>
        ) : null}
      </div>

      {/* Lag + steppers */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2.5">
          <span className="text-2xl leading-none">{match.home.flag}</span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{match.home.name}</p>
            <p className="text-xs text-faint">{match.home.code}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Stepper
            value={score.home}
            onChange={(v) => setScore(match.id, "home", v)}
            label={`mål ${match.home.name}`}
          />
          <span className="font-bold text-faint">–</span>
          <Stepper
            value={score.away}
            onChange={(v) => setScore(match.id, "away", v)}
            label={`mål ${match.away.name}`}
          />
        </div>

        <div className="flex flex-1 flex-row-reverse items-center gap-2.5 text-right">
          <span className="text-2xl leading-none">{match.away.flag}</span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{match.away.name}</p>
            <p className="text-xs text-faint">{match.away.code}</p>
          </div>
        </div>
      </div>

      {/* Härlett 1X2 */}
      <div className="mt-3 flex items-center justify-center gap-2 border-t border-border pt-3 text-xs">
        <span className="text-faint">Ditt tecken:</span>
        <span className={cn("font-bold", outcomeTone)}>
          {outcome === "1"
            ? `1 · ${match.home.code}`
            : outcome === "2"
              ? `2 · ${match.away.code}`
              : "X · oavgjort"}
        </span>
      </div>
    </div>
  );
}
