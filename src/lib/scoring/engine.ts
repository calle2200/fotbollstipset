/**
 * Poängmotor — ren räknelogik, inga databasanrop.
 *
 * Implementerad enligt docs/scoring-spec.md. Verifierad mot testfallen i
 * avsnitt 7 (se scripts/verify-scoring.mjs).
 *
 * Håll den här filen fri från sidoeffekter — det är den som avgör allas poäng,
 * och den ska gå att testa isolerat.
 */

// --- Parametrar (spec 3.2) ----------------------------------------------

/** Riskratten. 1.0 = full parimutuel (för brutalt), 0.5 = lagom. */
export const RISK_ALPHA = 0.5;
/** Laplace-smoothing: undviker division med noll och dämpar brus vid små fält. */
export const SMOOTHING = 0.5;
/** Golv — att pricka en storfavorit ska fortfarande vara värt något. */
export const M_MIN = 0.6;
/** Under detta antal spelare är procentsatser bara brus → alla får 1.0. */
export const MIN_PLAYERS = 4;

/** Resultatdelen betalar bara ut om tecknet är rätt (spec 4.1). */
export const SCORE_REQUIRES_CORRECT_1X2 = true;

/** Marknadens cap_factor (spec 3.2). */
export const CAP_FACTOR = {
  match: 1.0,
  special: 0.75,
} as const;

/** Baspoäng per delmoment (spec 4.1 och 4.3). */
export const BASE_POINTS = {
  match1x2: 10,
  matchScore: 10,
  advance: 8,
  winner: 100,
  /** Per korrekt land, max 3 träffar. */
  top4: 60,
  topscorer: 90,
  topassists: 80,
  bestgk: 70,
  mostgoals: 60,
  firstgoal: 20,
} as const;

/** Rundstege — multipliceras ovanpå riskmultiplikatorn (spec 4.2). */
export const ROUND_FACTOR = {
  group: 1.0,
  r16: 1.0,
  qf: 1.25,
  sf: 1.5,
  final: 2.0,
} as const;

export type Stage = keyof typeof ROUND_FACTOR;

// --- Riskmultiplikatorn (spec 3) ----------------------------------------

/** Dynamiskt tak: växer med fältets storlek, skalat av marknadens cap_factor. */
export function maxMultiplier(playerCount: number, capFactor = 1.0): number {
  const base = Math.min(4.0, Math.max(2.0, 1.5 + 0.45 * Math.log(playerCount)));
  return base * capFactor;
}

/**
 * Multiplikator per alternativ i en marknad.
 *
 * @param counts          alternativ -> antal spelare som valde det
 * @param playerCount     antal spelare som lämnat val i marknaden (N)
 * @param picksPerPlayer  antal val per spelare (s) — 1 utom för top4 där s = 3
 * @param capFactor       1.0 för matcher, 0.75 för specialval
 */
export function riskMultipliers(
  counts: Record<string, number>,
  playerCount: number,
  picksPerPlayer = 1,
  capFactor = 1.0,
): Record<string, number> {
  const options = Object.keys(counts);

  // För litet fält, eller inget att välja mellan → ingen viktning.
  if (playerCount < MIN_PLAYERS || options.length < 2) {
    return Object.fromEntries(options.map((o) => [o, 1.0]));
  }

  const denom = picksPerPlayer * playerCount + SMOOTHING * options.length;
  const share = (o: string) => (counts[o] + SMOOTHING) / denom;
  const H = options.reduce((sum, o) => sum + share(o) ** 2, 0);
  const cap = maxMultiplier(playerCount, capFactor);

  return Object.fromEntries(
    options.map((o) => [
      o,
      Math.min(cap, Math.max(M_MIN, (H / share(o)) ** RISK_ALPHA)),
    ]),
  );
}

// --- Poängberäkning ------------------------------------------------------

export type Score = { home: number; away: number };
export type Outcome = "1" | "X" | "2";

/** Avrunda till en decimal (spec 3.1). */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** 1X2 utifrån ett resultat. Avser full tid, 90 min (spec 4.2). */
export function outcomeOf(score: Score): Outcome {
  if (score.home > score.away) return "1";
  if (score.home < score.away) return "2";
  return "X";
}

/** Summan av målavvikelsen mot facit. */
export function deviation(pred: Score, actual: Score): number {
  return Math.abs(pred.home - actual.home) + Math.abs(pred.away - actual.away);
}

export type MatchAward = {
  /** Poäng för rätt tecken (redan multiplicerad och avrundad). */
  outcomePoints: number;
  /** Poäng för resultatets närhet (redan multiplicerad och avrundad). */
  scorePoints: number;
  total: number;
  correctOutcome: boolean;
  exactScore: boolean;
};

/**
 * Poäng för en match: tecken + exakt resultat.
 *
 * Resultatdelen använder samma multiplikator som teckendelen (spec 4.1, v1).
 * Rundstegen multipliceras ovanpå båda delarna.
 */
export function matchPoints({
  pred,
  actual,
  multiplier,
  stage = "group",
}: {
  pred: Score;
  actual: Score;
  /** Riskmultiplikator från marknaden match_1x2. */
  multiplier: number;
  stage?: Stage;
}): MatchAward {
  const roundFactor = ROUND_FACTOR[stage];
  const correctOutcome = outcomeOf(pred) === outcomeOf(actual);
  const dev = deviation(pred, actual);
  const exactScore = dev === 0;

  const outcomePoints = correctOutcome
    ? round1(BASE_POINTS.match1x2 * multiplier * roundFactor)
    : 0;

  // Utan rätt tecken ger resultatdelen 0 (gaten är på som standard).
  const payScore = SCORE_REQUIRES_CORRECT_1X2 ? correctOutcome : true;
  const rawScore = Math.max(0, BASE_POINTS.matchScore - 2 * dev);
  const scorePoints = payScore ? round1(rawScore * multiplier * roundFactor) : 0;

  return {
    outcomePoints,
    scorePoints,
    total: round1(outcomePoints + scorePoints),
    correctOutcome,
    exactScore,
  };
}

/** Poäng för avancemangsvalet i slutspel (spec 4.2). */
export function advancePoints({
  predictedTeamId,
  actualTeamId,
  multiplier,
  stage = "r16",
}: {
  predictedTeamId: string;
  actualTeamId: string;
  multiplier: number;
  stage?: Stage;
}): number {
  if (predictedTeamId !== actualTeamId) return 0;
  return round1(BASE_POINTS.advance * multiplier * ROUND_FACTOR[stage]);
}

/** Poäng för ett specialval med en enda rätt (vinnare, skyttekung osv.). */
export function specialPoints({
  market,
  picked,
  correct,
  multiplier,
}: {
  market: Exclude<keyof typeof BASE_POINTS, "match1x2" | "matchScore" | "advance" | "top4">;
  picked: string;
  /**
   * Rätt svar. Vid delad titel (t.ex. två med lika många mål) skickas flera —
   * full poäng till alla som tippat någon av dem (spec 4.3).
   */
  correct: string | string[];
  multiplier: number;
}): number {
  const answers = Array.isArray(correct) ? correct : [correct];
  if (!answers.includes(picked)) return 0;
  return round1(BASE_POINTS[market] * multiplier);
}

/**
 * Poäng för topp fyra.
 *
 * Spelaren väljer tre lag utöver sitt winner-tips. Varje val ger poäng om laget
 * är semifinalist och inte är samma lag som winner-tipset. Ordningen spelar
 * ingen roll. Varje val har sin egen multiplikator.
 */
export function topFourPoints({
  picks,
  semifinalists,
  winnerPick,
  multipliers,
}: {
  /** Spelarens tre lag. */
  picks: string[];
  /** De fyra semifinalisterna. */
  semifinalists: string[];
  /** Spelarens tips på turneringsvinnare — räknas separat, ger inte dubbelt. */
  winnerPick: string | null;
  /** Multiplikator per lag från top4-marknaden. */
  multipliers: Record<string, number>;
}): { perPick: { teamId: string; points: number }[]; total: number } {
  const seen = new Set<string>();
  const perPick = picks.map((teamId) => {
    const duplicate = seen.has(teamId);
    seen.add(teamId);

    const hit =
      !duplicate && semifinalists.includes(teamId) && teamId !== winnerPick;

    return {
      teamId,
      points: hit ? round1(BASE_POINTS.top4 * (multipliers[teamId] ?? 1)) : 0,
    };
  });

  return {
    perPick,
    total: round1(perPick.reduce((sum, p) => sum + p.points, 0)),
  };
}

/** Poäng för en gruppplacering — 10 p per rätt position (GDD avsnitt 5.2). */
export const GROUP_POSITION_POINTS = 10;

export function groupPositionPoints({
  predicted,
  actual,
  multiplier = 1,
}: {
  predicted: number;
  actual: number;
  multiplier?: number;
}): number {
  return predicted === actual ? round1(GROUP_POSITION_POINTS * multiplier) : 0;
}
