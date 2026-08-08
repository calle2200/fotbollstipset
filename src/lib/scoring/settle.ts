import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  BASE_POINTS,
  CAP_FACTOR,
  ROUND_FACTOR,
  matchPoints,
  outcomeOf,
  riskMultipliers,
  type Score,
  type Stage,
} from "@/lib/scoring/engine";

export type SettleResult = {
  ok: boolean;
  message: string;
  /** Antal spelare som hade tippat matchen. */
  players?: number;
  /** Total utdelad poäng. */
  totalPoints?: number;
  /** Multiplikator per alternativ, som den frystes. */
  multipliers?: Record<string, number>;
};

const marketIdFor = (matchId: string) => `match_1x2:${matchId}`;

/**
 * Räknar ut och sparar poäng för en match.
 *
 * Multiplikatorerna fryses första gången marknaden avgörs och återanvänds
 * därefter (spec 5) — annars skulle ställningen ändras retroaktivt när nya
 * spelare tillkommer. Poängen skrivs med upsert, så en omkörning (t.ex. efter
 * ett korrigerat resultat) uppdaterar istället för att dubbla.
 *
 * Anroparen ANSVARAR för att verifiera att användaren är admin.
 */
export async function settleMatch({
  matchId,
  actual,
  stage,
}: {
  matchId: string;
  actual: Score;
  stage: Stage;
}): Promise<SettleResult> {
  const supabase = await createSupabaseServerClient();
  const marketId = marketIdFor(matchId);

  // 1. Hämta allas tips på matchen (kräver admin — funktionen kollar det).
  const { data: picks, error: picksError } = await supabase.rpc("admin_match_picks", {
    p_match_id: matchId,
  });

  if (picksError) {
    return { ok: false, message: `Kunde inte läsa tipsen: ${picksError.message}` };
  }

  const rows = (picks ?? []) as { user_id: string; pred_home: number; pred_away: number }[];
  if (rows.length === 0) {
    return { ok: false, message: "Ingen har tippat den här matchen än." };
  }

  // 2. Räkna hur många som valde varje tecken.
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const o = outcomeOf({ home: r.pred_home, away: r.pred_away });
    counts[o] = (counts[o] ?? 0) + 1;
  }
  const playerCount = rows.length;

  // 3. Använd frysta multiplikatorer om marknaden redan avgjorts en gång.
  const { data: existing } = await supabase
    .from("market_multipliers")
    .select("option, multiplier")
    .eq("market_id", marketId);

  let multipliers: Record<string, number>;

  if (existing && existing.length > 0) {
    multipliers = Object.fromEntries(
      existing.map((r) => [r.option as string, Number(r.multiplier)]),
    );
  } else {
    multipliers = riskMultipliers(counts, playerCount, 1, CAP_FACTOR.match);

    const denom = playerCount + 0.5 * Object.keys(counts).length;
    const snapshot = Object.entries(counts).map(([option, n]) => ({
      market_id: marketId,
      option,
      player_count: playerCount,
      pick_count: n,
      share: (n + 0.5) / denom,
      multiplier: multipliers[option],
    }));

    const { error: mError } = await supabase.from("market_multipliers").insert(snapshot);
    if (mError) {
      return { ok: false, message: `Kunde inte spara multiplikatorerna: ${mError.message}` };
    }
  }

  // 4. Räkna poäng per spelare.
  const roundFactor = ROUND_FACTOR[stage];
  const awards: {
    market_id: string;
    user_id: string;
    component: string;
    base_points: number;
    multiplier: number;
    round_factor: number;
    points: number;
  }[] = [];

  let totalPoints = 0;

  for (const r of rows) {
    const pred: Score = { home: r.pred_home, away: r.pred_away };
    const multiplier = multipliers[outcomeOf(pred)] ?? 1;
    const award = matchPoints({ pred, actual, multiplier, stage });

    awards.push({
      market_id: marketId,
      user_id: r.user_id,
      component: "1x2",
      base_points: BASE_POINTS.match1x2,
      multiplier,
      round_factor: roundFactor,
      points: award.outcomePoints,
    });

    awards.push({
      market_id: marketId,
      user_id: r.user_id,
      component: "score",
      base_points: BASE_POINTS.matchScore,
      multiplier,
      round_factor: roundFactor,
      points: award.scorePoints,
    });

    totalPoints += award.total;
  }

  const { error: aError } = await supabase
    .from("awards")
    .upsert(awards, { onConflict: "market_id,user_id,component" });

  if (aError) {
    return { ok: false, message: `Kunde inte spara poängen: ${aError.message}` };
  }

  // 5. Spara resultatet på matchen.
  const { error: mUpdate } = await supabase
    .from("matches")
    .update({ home_score: actual.home, away_score: actual.away, status: "finished" })
    .eq("id", matchId);

  if (mUpdate) {
    return {
      ok: false,
      message: `Poängen sparades, men resultatet kunde inte uppdateras: ${mUpdate.message}`,
    };
  }

  return {
    ok: true,
    message: `Klart — ${playerCount} ${
      playerCount === 1 ? "spelare" : "spelare"
    } fick poäng.`,
    players: playerCount,
    totalPoints: Math.round(totalPoints * 10) / 10,
    multipliers,
  };
}
