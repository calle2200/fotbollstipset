// Litet kopplingstest: läser .env.local och pingar Supabase.
// Kör med:  node scripts/check-supabase.mjs
import { readFileSync } from "node:fs";

function loadEnv(path) {
  const env = {};
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return env;
}

let env;
try {
  env = loadEnv(".env.local");
} catch {
  console.error("❌ Hittade ingen .env.local. Skapa den och fyll i dina värden.");
  process.exit(1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key || url.includes("DIN-") || key.includes("DIN-")) {
  console.error("❌ Fyll i NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY i .env.local först.");
  process.exit(1);
}

try {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (res.ok) {
    console.log(`✅ Kopplingen fungerar! Supabase svarade OK (status ${res.status}).`);
  } else if (res.status === 401) {
    console.error("❌ Nådde URL:en men nyckeln nekades (401). Är det verkligen anon/public-nyckeln?");
    process.exit(1);
  } else {
    console.error(`⚠️ Oväntad status ${res.status}. Dubbelkolla URL och nyckel.`);
    process.exit(1);
  }
} catch (e) {
  console.error("❌ Kunde inte nå URL:en. Är NEXT_PUBLIC_SUPABASE_URL korrekt?");
  console.error("   Detalj:", e.message);
  process.exit(1);
}
