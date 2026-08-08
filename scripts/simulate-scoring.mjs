/**
 * Simulering enligt docs/scoring-spec.md avsnitt 8.
 *
 * Genererar syntetiska spelare (majoriteten följer favoriter, en minoritet
 * chansar), kör igenom slumpade turneringar och mäter:
 *   1. Hur ofta avgörs segern av ett enda longshot-tips (>15 % av totalen)?
 *   2. Spridningen mellan vinnare och median.
 *   3. Korrelerar slutplaceringen med antal rätt, eller bara med tur?
 *
 * Kör med:  node scripts/simulate-scoring.mjs [antal_körningar]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RUNS = Number(process.argv[2]) || 300;
const FIELD_SIZES = [10, 50, 200];

// --- Ladda motorn --------------------------------------------------------
const outDir = mkdtempSync(join(tmpdir(), "pickem-sim-"));
execFileSync(
  "npx",
  ["tsc", "src/lib/scoring/engine.ts", "--outDir", outDir, "--module", "es2022",
   "--target", "es2022", "--moduleResolution", "bundler", "--skipLibCheck"],
  { stdio: "pipe", shell: true },
);
const engine = await import(pathToFileURL(join(outDir, "engine.js")).href);
const { riskMultipliers, matchPoints, outcomeOf, BASE_POINTS, ROUND_FACTOR, CAP_FACTOR } = engine;

// --- Slumphjälpare -------------------------------------------------------
const rand = () => Math.random();
const randInt = (n) => Math.floor(rand() * n);

/** Poissonfördelat antal mål. */
function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rand();
  } while (p > L);
  return k - 1;
}

/** Väljer ett index med sannolikhet proportionell mot vikterna. */
function weightedIndex(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

// --- Turneringsmodell ----------------------------------------------------
const TEAM_COUNT = 24;
const GROUP_MATCHES = 36;
const KNOCKOUT = [
  ...Array(8).fill("r16"),
  ...Array(4).fill("qf"),
  ...Array(2).fill("sf"),
  "final",
];

/** 24 lag med varierande styrka — några favoriter, många medelmåttor. */
function makeTeams() {
  return Array.from({ length: TEAM_COUNT }, (_, i) => ({
    id: `T${i}`,
    // Lognormal-ish: ett fåtal riktigt starka lag.
    strength: Math.exp(1.1 * (rand() - 0.35)),
  }));
}

/** Förväntade mål utifrån relativ styrka. */
function lambdas(a, b) {
  const ratio = a.strength / b.strength;
  return [1.35 * Math.sqrt(ratio), 1.35 * Math.sqrt(1 / ratio)];
}

/** Poisson-sannolikheten för exakt k mål. */
const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600];
const pmf = (lambda, k) => (Math.exp(-lambda) * lambda ** k) / FACT[k];

/**
 * Exakta sannolikheter för 1/X/2 — analytiskt istället för samplat.
 * Sampling gav brus som dominerade resultatet vid rimligt antal körningar.
 */
function outcomeProbs(a, b) {
  const [la, lb] = lambdas(a, b);
  const MAX = 12;
  let one = 0, x = 0, two = 0;
  for (let h = 0; h <= MAX; h++) {
    const ph = pmf(la, h);
    for (let aw = 0; aw <= MAX; aw++) {
      const p = ph * pmf(lb, aw);
      if (h > aw) one += p;
      else if (h < aw) two += p;
      else x += p;
    }
  }
  const total = one + x + two;
  return { "1": one / total, X: x / total, "2": two / total };
}

/** Bygger en turnering: matcher med facit, plus specialutfall. */
function simulateTournament(teams) {
  const matches = [];

  const addMatch = (stage) => {
    let i = randInt(TEAM_COUNT);
    let j = randInt(TEAM_COUNT);
    while (j === i) j = randInt(TEAM_COUNT);
    const home = teams[i], away = teams[j];
    const [la, lb] = lambdas(home, away);
    matches.push({
      id: `m${matches.length}`,
      stage,
      home,
      away,
      probs: outcomeProbs(home, away),
      actual: { home: poisson(la), away: poisson(lb) },
    });
  };

  for (let i = 0; i < GROUP_MATCHES; i++) addMatch("group");
  for (const stage of KNOCKOUT) addMatch(stage);

  // Specialutfall — starka lag vinner oftare.
  const weights = teams.map((t) => t.strength ** 2);
  const pickTeam = () => teams[weightedIndex(weights)].id;

  const winner = pickTeam();
  const semis = new Set([winner]);
  while (semis.size < 4) semis.add(pickTeam());

  return {
    matches,
    specials: {
      winner,
      semifinalists: [...semis],
      mostgoals: pickTeam(),
      firstgoal: teams[randInt(TEAM_COUNT)].id, // första målet är i princip slump
      // Utmärkelser vinns oftast av en välkänd spelare (den pool folk tippar
      // från), men ibland av en överraskning. Rent slumpmässigt utfall skulle
      // låta obskyra tips vinna orealistiskt ofta.
      topscorer: rand() < 0.7 ? `P${randInt(12)}` : `P${randInt(60)}`,
      topassists: rand() < 0.7 ? `A${randInt(12)}` : `A${randInt(60)}`,
      bestgk: rand() < 0.7 ? `G${randInt(8)}` : `G${randInt(24)}`,
    },
  };
}

// --- Spelarmodell --------------------------------------------------------
/**
 * Majoriteten följer favoriter, en minoritet chansar.
 * `gamble` = sannolikheten att spelaren väljer något annat än favoriten.
 */
function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: `u${i}`,
    // ~75 % försiktiga, ~25 % chansare.
    gamble: rand() < 0.75 ? 0.05 + rand() * 0.15 : 0.4 + rand() * 0.45,
  }));
}

const COMMON_SCORES = {
  "1": [[1, 0], [2, 0], [2, 1], [3, 1], [3, 0]],
  X: [[0, 0], [1, 1], [2, 2]],
  "2": [[0, 1], [0, 2], [1, 2], [1, 3], [0, 3]],
};

/** Ett spelartips på en match. */
function pickMatch(player, match) {
  const opts = ["1", "X", "2"];
  const probs = opts.map((o) => match.probs[o]);
  const favourite = opts[probs.indexOf(Math.max(...probs))];

  let choice;
  if (rand() < player.gamble) {
    // Chansar — väljer bland de mindre sannolika.
    const others = opts.filter((o) => o !== favourite);
    choice = others[randInt(others.length)];
  } else {
    choice = favourite;
  }

  const scores = COMMON_SCORES[choice];
  const [h, a] = scores[randInt(scores.length)];
  return { home: h, away: a };
}

/** Ett spelartips på ett lagbaserat specialval. */
function pickTeamSpecial(player, teams) {
  const weights = teams.map((t) => (rand() < player.gamble ? 1 : t.strength ** 3));
  return teams[weightedIndex(weights)].id;
}

// --- En körning ----------------------------------------------------------
function runOnce(fieldSize, specialCap = CAP_FACTOR.special, flat = false) {
  // flat = kontrollkörning helt utan riskviktning (alla multiplikatorer 1.0),
  // för att se hur mycket av variansen som faktiskt kommer från systemet.
  const risk = flat
    ? (counts) => Object.fromEntries(Object.keys(counts).map((o) => [o, 1]))
    : riskMultipliers;
  const teams = makeTeams();
  const tournament = simulateTournament(teams);
  const players = makePlayers(fieldSize);

  // Alla tips först — multiplikatorerna beror på hela fältet.
  const matchPicks = tournament.matches.map((m) =>
    players.map((p) => pickMatch(p, m)),
  );
  const winnerPicks = players.map((p) => pickTeamSpecial(p, teams));
  const top4Picks = players.map((p) => [
    pickTeamSpecial(p, teams),
    pickTeamSpecial(p, teams),
    pickTeamSpecial(p, teams),
  ]);
  const scorerPicks = players.map((p) =>
    rand() < p.gamble ? `P${randInt(60)}` : `P${randInt(12)}`,
  );
  const assistPicks = players.map((p) =>
    rand() < p.gamble ? `A${randInt(60)}` : `A${randInt(12)}`,
  );
  const keeperPicks = players.map((p) =>
    rand() < p.gamble ? `G${randInt(24)}` : `G${randInt(8)}`,
  );
  const mostGoalsPicks = players.map((p) => pickTeamSpecial(p, teams));
  const firstGoalPicks = players.map((p) => pickTeamSpecial(p, teams));

  // Poäng per spelare, plus varje enskild utdelning (för longshot-måttet).
  const totals = new Array(fieldSize).fill(0);
  const biggest = new Array(fieldSize).fill(0);
  const biggestSource = new Array(fieldSize).fill("");
  const biggestMult = new Array(fieldSize).fill(0);
  const correct = new Array(fieldSize).fill(0);

  const record = (i, points, source = "match", mult = 1) => {
    totals[i] += points;
    if (points > biggest[i]) {
      biggest[i] = points;
      biggestSource[i] = source;
      biggestMult[i] = mult;
    }
    if (points > 0) correct[i]++;
  };

  // Matcher
  tournament.matches.forEach((m, mi) => {
    const picks = matchPicks[mi];
    const counts = {};
    for (const pick of picks) {
      const o = outcomeOf(pick);
      counts[o] = (counts[o] ?? 0) + 1;
    }
    const mult = risk(counts, fieldSize, 1, CAP_FACTOR.match);

    picks.forEach((pick, i) => {
      const award = matchPoints({
        pred: pick,
        actual: m.actual,
        multiplier: mult[outcomeOf(pick)] ?? 1,
        stage: m.stage,
      });
      // Räknas som två utdelningar (tecken + resultat), som i awards-tabellen.
      record(i, award.outcomePoints);
      if (award.scorePoints > 0) record(i, award.scorePoints);
    });
  });

  // Turneringsvinnare
  {
    const counts = {};
    for (const p of winnerPicks) counts[p] = (counts[p] ?? 0) + 1;
    const mult = risk(counts, fieldSize, 1, specialCap);
    winnerPicks.forEach((pick, i) => {
      if (pick === tournament.specials.winner) {
        record(i, BASE_POINTS.winner * (mult[pick] ?? 1), "special", mult[pick] ?? 1);
      }
    });
  }

  // Topp fyra (s = 3)
  {
    const counts = {};
    for (const picks of top4Picks) {
      for (const p of picks) counts[p] = (counts[p] ?? 0) + 1;
    }
    const mult = risk(counts, fieldSize, 3, specialCap);
    top4Picks.forEach((picks, i) => {
      const seen = new Set();
      for (const p of picks) {
        if (seen.has(p)) continue;
        seen.add(p);
        if (
          tournament.specials.semifinalists.includes(p) &&
          p !== winnerPicks[i]
        ) {
          record(i, BASE_POINTS.top4 * (mult[p] ?? 1), "special", mult[p] ?? 1);
        }
      }
    });
  }

  // Övriga specialval med ett rätt svar var.
  const singlePickSpecials = [
    { picks: scorerPicks, answer: tournament.specials.topscorer, base: BASE_POINTS.topscorer },
    { picks: assistPicks, answer: tournament.specials.topassists, base: BASE_POINTS.topassists },
    { picks: keeperPicks, answer: tournament.specials.bestgk, base: BASE_POINTS.bestgk },
    { picks: mostGoalsPicks, answer: tournament.specials.mostgoals, base: BASE_POINTS.mostgoals },
    { picks: firstGoalPicks, answer: tournament.specials.firstgoal, base: BASE_POINTS.firstgoal },
  ];

  for (const { picks, answer, base } of singlePickSpecials) {
    const counts = {};
    for (const p of picks) counts[p] = (counts[p] ?? 0) + 1;
    const mult = risk(counts, fieldSize, 1, specialCap);
    picks.forEach((pick, i) => {
      if (pick === answer) {
        record(i, base * (mult[pick] ?? 1), "special", mult[pick] ?? 1);
      }
    });
  }

  // --- Mått för den här körningen
  const order = totals.map((t, i) => i).sort((a, b) => totals[b] - totals[a]);
  const winnerIdx = order[0];
  const sorted = [...totals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // Spearman-korrelation mellan poäng och antal rätt.
  const rankOf = (arr) => {
    const idx = arr.map((v, i) => i).sort((a, b) => arr[b] - arr[a]);
    const r = new Array(arr.length);
    idx.forEach((id, pos) => (r[id] = pos + 1));
    return r;
  };
  const rp = rankOf(totals);
  const rc = rankOf(correct);
  const n = fieldSize;
  const dSq = rp.reduce((sum, v, i) => sum + (v - rc[i]) ** 2, 0);
  const spearman = 1 - (6 * dSq) / (n * (n * n - 1));

  return {
    longshotDecided: biggest[winnerIdx] > 0.15 * totals[winnerIdx],
    decidedBySpecial: biggestSource[winnerIdx] === "special",
    decidingMultiplier: biggestMult[winnerIdx],
    spread: median > 0 ? totals[winnerIdx] / median : Infinity,
    spearman,
  };
}

// --- Kör och rapportera --------------------------------------------------
function measure(size, specialCap, flat = false) {
  let longshot = 0;
  let viaSpecial = 0;
  let multSum = 0;
  let spreadSum = 0;
  let spearmanSum = 0;

  for (let i = 0; i < RUNS; i++) {
    const r = runOnce(size, specialCap, flat);
    if (r.longshotDecided) {
      longshot++;
      if (r.decidedBySpecial) viaSpecial++;
      multSum += r.decidingMultiplier;
    }
    spreadSum += r.spread;
    spearmanSum += r.spearman;
  }

  return {
    pct: (longshot / RUNS) * 100,
    specialShare: longshot > 0 ? (viaSpecial / longshot) * 100 : 0,
    avgMult: longshot > 0 ? multSum / longshot : 0,
    spread: spreadSum / RUNS,
    corr: spearmanSum / RUNS,
  };
}

console.log(`Simulering — ${RUNS} körningar per fältstorlek`);
console.log(`cap_factor specialval: ${CAP_FACTOR.special}\n`);
console.log("Fält   Longshot   varav special   snitt-multiplikator   Vinnare/median   Korrelation");
console.log("─".repeat(88));

const baseline = [];
for (const size of FIELD_SIZES) {
  const r = measure(size, CAP_FACTOR.special);
  baseline.push({ size, ...r });
  console.log(
    `${String(size).padEnd(6)} ${r.pct.toFixed(1).padStart(6)} %    ` +
      `${r.specialShare.toFixed(0).padStart(7)} %        ` +
      `${r.avgMult.toFixed(2).padStart(9)}×        ` +
      `${r.spread.toFixed(2).padStart(6)}×        ${r.corr.toFixed(3).padStart(6)}` +
      (r.pct > 30 ? "  ⚠️" : "  ✓"),
  );
}

// Kontroll: hur ser måttet ut helt utan riskviktning? Om ett vanligt tipsspel
// redan ligger nära 30 % är det baspoängen — inte multiplikatorn — som styr.
console.log("\nKontroll — utan riskviktning alls (alla multiplikatorer = 1,0):");
console.log("Fält   Longshot   Vinnare/median   Korrelation");
console.log("─".repeat(52));
for (const size of FIELD_SIZES) {
  const r = measure(size, CAP_FACTOR.special, true);
  console.log(
    `${String(size).padEnd(6)} ${r.pct.toFixed(1).padStart(6)} %    ` +
      `${r.spread.toFixed(2).padStart(9)}×        ${r.corr.toFixed(3).padStart(6)}`,
  );
}

// Hjälper det faktiskt att sänka taket? Testa några värden.
console.log("\nEffekt av lägre tak på specialval (longshot-andel):");
console.log("cap_factor    N=10     N=50    N=200");
console.log("─".repeat(44));
for (const cap of [0.75, 0.6, 0.5, 0.4]) {
  const cells = FIELD_SIZES.map((size) => measure(size, cap).pct);
  console.log(
    `${cap.toFixed(2).padEnd(12)} ` +
      cells.map((c) => `${c.toFixed(1).padStart(5)} %`).join("  "),
  );
}

rmSync(outDir, { recursive: true, force: true });

console.log("\nTolkning (spec 8):");
console.log("  • Longshot          — enskild träff > 15 % av vinnarens total. Bör vara < ~30 %.");
console.log("  • varav special     — hur stor del av dem som kom från ett specialval.");
console.log("  • snitt-multiplikator — var multiplikatorn hög, eller räckte baspoängen?");
console.log("  • Vinnare/median    — hur mycket vinnaren drar ifrån mitten.");
console.log("  • Korrelation       — 1,0 = ren skicklighet, 0 = ren tur.");
