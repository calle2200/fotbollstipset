"use client";

import { useActionState } from "react";
import { settleMatchAction, type ActionState } from "@/app/(app)/admin/actions";
import type { Match } from "@/lib/mock/data";

export function SettleMatchForm({ match }: { match: Match }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    settleMatchAction,
    null,
  );

  const settled = match.status === "finished";

  return (
    <li className="px-5 py-3">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="matchId" value={match.id} />
        <input type="hidden" name="stage" value={match.stage} />

        <span className="flex-1 truncate text-sm text-ink">
          {match.home.flag} {match.home.code}{" "}
          <span className="text-faint">vs</span> {match.away.code} {match.away.flag}
          {match.group && <span className="ml-2 text-xs text-faint">Grupp {match.group}</span>}
          {match.stage !== "group" && (
            <span className="ml-2 text-xs text-brand">{match.stage.toUpperCase()}</span>
          )}
        </span>

        <input
          name="home"
          type="number"
          min={0}
          max={30}
          required
          defaultValue={match.homeScore ?? ""}
          placeholder="–"
          className="h-9 w-12 rounded-lg border border-border bg-surface-2 text-center text-ink placeholder:text-faint focus:border-brand/50 focus:outline-none"
        />
        <span className="text-faint">–</span>
        <input
          name="away"
          type="number"
          min={0}
          max={30}
          required
          defaultValue={match.awayScore ?? ""}
          placeholder="–"
          className="h-9 w-12 rounded-lg border border-border bg-surface-2 text-center text-ink placeholder:text-faint focus:border-brand/50 focus:outline-none"
        />

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-semibold text-[#08120b] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Räknar…" : settled ? "Räkna om" : "Räkna poäng"}
        </button>
      </form>

      {state?.matchId === match.id && (
        <p className={`mt-2 text-xs ${state.ok ? "text-brand" : "text-pink"}`}>
          {state.ok ? "✓ " : "✗ "}
          {state.message}
        </p>
      )}
    </li>
  );
}
