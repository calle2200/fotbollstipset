// Litet kopplingstest: läser .env.local och testar via Supabases officiella
// klient (som hanterar den nya nyckeltypen korrekt).
// Kör med:  node scripts/check-supabase.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

const supabase = createClient(url, key);

// Vi frågar efter en tabell som inte finns än. Om nyckeln godkänns får vi ett
// "tabellen finns inte"-fel (= kopplingen funkar). Nekas nyckeln får vi ett
// nyckel-/behörighetsfel istället.
const { error } = await supabase.from("__connection_check__").select("*").limit(1);

if (!error) {
  console.log("✅ Kopplingen fungerar! Nyckeln godkänd.");
  process.exit(0);
}

const msg = (error.message || "").toLowerCase();
const code = error.code || "";

if (
  code === "PGRST205" ||
  msg.includes("could not find the table") ||
  msg.includes("does not exist") ||
  msg.includes("schema cache")
) {
  console.log("✅ Kopplingen fungerar! Nyckeln godkänd.");
  console.log("   (Testtabellen finns inte än — helt väntat, vi har inga tabeller ännu.)");
  process.exit(0);
}

if (msg.includes("invalid api key") || msg.includes("api key") || msg.includes("jwt")) {
  console.error("❌ Nyckeln nekades. Kontrollera att hela publishable-nyckeln kopierats (inget saknas i början/slutet).");
  console.error("   Detalj:", error.message);
  process.exit(1);
}

console.error("⚠️ Oväntat svar:", error.message, code ? `(kod: ${code})` : "");
process.exit(1);
