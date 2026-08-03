"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { MatchPicker } from "@/components/tips/MatchPicker";
import { GroupOrder } from "@/components/tips/GroupOrder";
import { SpecialPicks } from "@/components/tips/SpecialPicks";
import { KnockoutRounds } from "@/components/tips/KnockoutRounds";
import { matches, teams } from "@/lib/mock/data";
import { cn } from "@/lib/cn";

type TabId = "gruppmatcher" | "placeringar" | "specialval" | "slutspel";

const tabs: { id: TabId; label: string }[] = [
  { id: "gruppmatcher", label: "Gruppmatcher" },
  { id: "placeringar", label: "Gruppplaceringar" },
  { id: "specialval", label: "Specialval" },
  { id: "slutspel", label: "Slutspel" },
];

export function TipsTabs({ initialTab = "gruppmatcher" }: { initialTab?: TabId }) {
  const [active, setActive] = useState<TabId>(initialTab);

  const groupMatches = matches.filter((m) => m.stage === "group");
  const groups = [...new Set(teams.map((t) => t.group))];

  return (
    <div className="space-y-6">
      {/* Flikrad */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 rounded-full border border-border bg-surface/60 p-1 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active === tab.id
                  ? "bg-brand text-[#08120b]"
                  : "text-muted hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Innehåll per flik */}
      {active === "gruppmatcher" && (
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
      )}

      {active === "placeringar" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Gruppplaceringar</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((g) => (
              <GroupOrder key={g} group={g} />
            ))}
          </div>
        </section>
      )}

      {active === "specialval" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Specialval</h2>
            <Badge tone="gold">Max 620 p</Badge>
          </div>
          <SpecialPicks />
        </section>
      )}

      {active === "slutspel" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Slutspel</h2>
            <Badge tone="muted">Fas 2</Badge>
          </div>
          <KnockoutRounds />
        </section>
      )}
    </div>
  );
}
