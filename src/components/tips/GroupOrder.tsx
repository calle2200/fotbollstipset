"use client";

import { Card } from "@/components/ui/Card";
import { groupColor } from "@/lib/groupColors";
import { usePredictions } from "@/lib/predictions/store";
import { teams } from "@/lib/mock/data";
import { cn } from "@/lib/cn";

/** Interaktiv gruppplacering — flytta lag upp/ner, sparas i storen. */
export function GroupOrder({ group }: { group: string }) {
  const { orders, moveTeam } = usePredictions();
  const c = groupColor(group);
  const order = orders[group] ?? [];
  const team = (id: string) => teams.find((t) => t.id === id)!;

  return (
    <Card>
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold", c.bg, c.text)}>
          {group}
        </span>
        <div>
          <h3 className="font-semibold tracking-tight text-ink">Grupp {group}</h3>
          <p className="text-sm text-muted">Ordna lagen 1–4 med pilarna</p>
        </div>
      </div>

      <ol className="divide-y divide-border">
        {order.map((id, i) => {
          const t = team(id);
          return (
            <li key={id} className="flex items-center gap-3 px-5 py-3">
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold", c.bg, c.text)}>
                {i + 1}
              </span>
              <span className="text-xl">{t.flag}</span>
              <span className="flex-1 font-medium text-ink">{t.name}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveTeam(group, i, -1)}
                  disabled={i === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-ink disabled:opacity-30 disabled:hover:text-muted"
                  aria-label={`Flytta ${t.name} upp`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveTeam(group, i, 1)}
                  disabled={i === order.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-ink disabled:opacity-30 disabled:hover:text-muted"
                  aria-label={`Flytta ${t.name} ner`}
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
