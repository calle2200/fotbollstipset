"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { usePredictions } from "@/lib/predictions/store";
import { teams, players, specialPicks } from "@/lib/mock/data";

type Option = { value: string; label: string };

const teamOptions: Option[] = teams.map((t) => ({ value: t.id, label: `${t.flag} ${t.name}` }));
const playerOptions: Option[] = players.map((p) => ({ value: p.id, label: `${p.name} (${p.teamCode})` }));
const keeperOptions: Option[] = players
  .filter((p) => p.position === "GK")
  .map((p) => ({ value: p.id, label: `${p.name} (${p.teamCode})` }));

// Vilka kandidater varje specialval väljer bland.
const optionsFor: Record<string, Option[]> = {
  winner: teamOptions,
  most_goals_team: teamOptions,
  first_goal_team: teamOptions,
  golden_boot: playerOptions,
  assists: playerOptions,
  keeper: keeperOptions,
  top_four: teamOptions,
};

const toneFor = ["violet", "pink", "cyan", "mint", "orange", "blue", "brand"] as const;

function Select({
  value,
  onChange,
  options,
  placeholder = "Välj…",
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-lg border border-border bg-surface-2 px-2.5 text-sm text-ink focus:border-brand/50 focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SpecialPicks() {
  const { specials, setSpecial } = usePredictions();

  return (
    <Card>
      <ul className="divide-y divide-border">
        {specialPicks.map((sp, i) => {
          const opts = optionsFor[sp.id] ?? teamOptions;
          const isTopFour = sp.id === "top_four";

          return (
            <li key={sp.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Badge tone={toneFor[i % toneFor.length]}>{sp.maxPoints} p</Badge>
                <span className="font-medium text-ink">{sp.label}</span>
              </div>

              {isTopFour ? (
                <div className="grid grid-cols-2 gap-2 sm:w-72">
                  {[0, 1, 2, 3].map((slot) => (
                    <Select
                      key={slot}
                      value={specials[`top_four:${slot}`] ?? ""}
                      onChange={(v) => setSpecial(`top_four:${slot}`, v)}
                      options={opts}
                      placeholder={`Lag ${slot + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="sm:w-72">
                  <Select
                    value={specials[sp.id] ?? ""}
                    onChange={(v) => setSpecial(sp.id, v)}
                    options={opts}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
