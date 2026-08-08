/**
 * Verifierar poängmotorn mot testfallen i docs/scoring-spec.md avsnitt 7.
 * Tolerans ±0,001 enligt specen.
 *
 * Kör med:  node scripts/verify-scoring.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const TOLERANCE = 0.001;

// Kompilera motorn till ett temporärt bibliotek och ladda in den.
const outDir = mkdtempSync(join(tmpdir(), "pickem-scoring-"));
try {
  execFileSync(
    "npx",
    [
      "tsc",
      "src/lib/scoring/engine.ts",
      "--outDir",
      outDir,
      "--module",
      "es2022",
      "--target",
      "es2022",
      "--moduleResolution",
      "bundler",
      "--skipLibCheck",
    ],
    { stdio: "pipe", shell: true },
  );
} catch (e) {
  console.error("Kunde inte kompilera engine.ts:\n" + (e.stdout?.toString() ?? e.message));
  process.exit(1);
}

const engine = await import(pathToFileURL(join(outDir, "engine.js")).href);
const { riskMultipliers, maxMultiplier, matchPoints, M_MIN } = engine;

let passed = 0;
let failed = 0;

function check(label, actual, expected, tol = TOLERANCE) {
  const ok = Math.abs(actual - expected) <= tol;
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}: ${actual.toFixed(6)}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}: fick ${actual.toFixed(6)}, väntade ${expected.toFixed(6)}`);
  }
}

function assert(label, condition) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
  }
}

// --- 7.1 Litet fält, koncentrerad marknad -------------------------------
console.log("\n7.1 Litet fält, koncentrerad marknad (N=10)");
{
  const m = riskMultipliers({ "1": 8, X: 1, "2": 1 }, 10, 1, 1.0);
  check("M(1)", m["1"], 0.886097);
  check("M(X)", m["X"], 2.109332);
  check("M(2)", m["2"], 2.109332);
  check("M_max(10)", maxMultiplier(10, 1.0), 2.5363, 0.001);

  // "Rätt tecken på X ger 10 × 2.1093 = 21.1 poäng."
  const award = matchPoints({
    pred: { home: 1, away: 1 },
    actual: { home: 2, away: 2 },
    multiplier: m["X"],
    stage: "group",
  });
  check("Rätt X → teckenpoäng", award.outcomePoints, 21.1, 0.05);
}

// --- 7.2 Stort fält, taket binder ---------------------------------------
console.log("\n7.2 Stort fält, taket binder (N=200)");
{
  const counts = { A: 100, B: 60, C: 38, D: 2 };
  const m = riskMultipliers(counts, 200, 1, 1.0);
  check("M_max(200)", maxMultiplier(200, 1.0), 3.8842, 0.001);
  check("M(A)", m["A"], 0.866715);
  check("M(D) kapad till taket", m["D"], 3.8842, 0.001);

  const mSpecial = riskMultipliers(counts, 200, 1, 0.75);
  check("M_max(200, f=0.75)", maxMultiplier(200, 0.75), 2.9132, 0.001);
  check("M(A) opåverkad av cap_factor", mSpecial["A"], 0.866715);
  check("M(D) kapad till specialtaket", mSpecial["D"], 2.9132, 0.001);
}

// --- 7.3 Under tröskeln --------------------------------------------------
console.log("\n7.3 Under tröskeln (N=3)");
{
  const m = riskMultipliers({ "1": 2, X: 1 }, 3, 1, 1.0);
  check("M(1)", m["1"], 1.0);
  check("M(X)", m["X"], 1.0);
}

// --- 7.4 Exakt resultat --------------------------------------------------
console.log("\n7.4 Exakt resultat (facit 2–0, multiplikator 1.0)");
{
  const actual = { home: 2, away: 0 };
  const cases = [
    { pred: { home: 2, away: 0 }, expected: 10 },
    { pred: { home: 1, away: 0 }, expected: 8 },
    { pred: { home: 3, away: 0 }, expected: 8 },
    { pred: { home: 3, away: 1 }, expected: 6 },
    { pred: { home: 5, away: 0 }, expected: 4 },
    { pred: { home: 0, away: 2 }, expected: 0 },
    { pred: { home: 1, away: 1 }, expected: 0 },
  ];
  for (const c of cases) {
    const a = matchPoints({ pred: c.pred, actual, multiplier: 1.0 });
    check(`${c.pred.home}-${c.pred.away} → resultatdel`, a.scorePoints, c.expected);
  }
}

// --- 3.3 Taktabellen -----------------------------------------------------
console.log("\n3.3 Dynamiskt tak");
{
  const table = [
    [4, 2.12, 1.59],
    [10, 2.54, 1.90],
    [25, 2.95, 2.21],
    [50, 3.26, 2.45],
    [100, 3.57, 2.68],
    [250, 3.98, 2.99],
    [1000, 4.0, 3.0],
  ];
  for (const [n, match, special] of table) {
    check(`M_max(${n}, f=1.0)`, maxMultiplier(n, 1.0), match, 0.01);
    check(`M_max(${n}, f=0.75)`, maxMultiplier(n, 0.75), special, 0.01);
  }
}

// --- 7.5 Egenskaper ------------------------------------------------------
console.log("\n7.5 Egenskaper");
{
  // Andelarna summerar till 1.
  const counts = { A: 12, B: 7, C: 3, D: 1 };
  const N = 23;
  const K = Object.keys(counts).length;
  const denom = 1 * N + 0.5 * K;
  const shares = Object.values(counts).map((n) => (n + 0.5) / denom);
  check("Andelarna summerar till 1", shares.reduce((a, b) => a + b, 0), 1.0);

  // Alla multiplikatorer inom [M_min, M_max].
  const m = riskMultipliers(counts, N, 1, 1.0);
  const cap = maxMultiplier(N, 1.0);
  assert(
    "Alla multiplikatorer inom [M_min, M_max]",
    Object.values(m).every((v) => v >= M_MIN - 1e-9 && v <= cap + 1e-9),
  );

  // Strikt avtagande i p_i: fler väljare → lägre multiplikator.
  assert(
    "Multiplikatorn avtar med populariteten",
    m["A"] < m["B"] && m["B"] < m["C"] && m["C"] < m["D"],
  );

  // Perfekt jämn marknad → alla exakt 1.0.
  const even = riskMultipliers({ A: 5, B: 5, C: 5, D: 5 }, 20, 1, 1.0);
  for (const [opt, val] of Object.entries(even)) {
    check(`Jämn marknad: M(${opt})`, val, 1.0);
  }
}

rmSync(outDir, { recursive: true, force: true });

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} godkända, ${failed} misslyckade`);
process.exit(failed === 0 ? 0 : 1);
