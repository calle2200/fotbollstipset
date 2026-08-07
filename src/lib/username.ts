/**
 * Validering av användarnamn.
 *
 * Listorna nedan är medvetet enkla att fylla på — lägg bara till fler ord.
 * Matchningen sker mot en normaliserad form (gemener, utan skiljetecken och
 * med vanliga siffersubstitutioner återställda), så "K3vin_1d10t" fångas också.
 */

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

/** Namn som skulle kunna förväxlas med appen eller en funktion. */
const RESERVED = [
  "admin",
  "administrator",
  "moderator",
  "support",
  "system",
  "pickem",
  "root",
  "official",
  "staff",
  "help",
  "null",
  "undefined",
];

/**
 * Olämpliga ord. Fyll gärna på.
 * Obs: matchas som delsträng, så undvik korta ord som förekommer inuti
 * oskyldiga ord (t.ex. "anal" skulle träffa "analys").
 */
const BANNED = [
  // svenska
  "fitta",
  "hora",
  "bogfitta",
  "cp-skada",
  "javlaneger",
  "neger",
  "blatte",
  "svartskalle",
  "bogjavel",
  "kukhuvud",
  "fanskap",
  // engelska
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "rapist",
  "pedophile",
  "pedofil",
  "nazi",
  "hitler",
  "kkk",
  "cunt",
  "whore",
];

/** Gör om till jämförbar form: gemener, utan skiljetecken, utan leetspeak. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[0]/g, "o")
    .replace(/[1|!]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-zåäö]/g, "");
}

export type UsernameCheck =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Kontrollerar format, reserverade och olämpliga ord. (Unikhet sker i databasen.) */
export function validateUsername(raw: string): UsernameCheck {
  const value = raw.trim();

  if (value.length < USERNAME_MIN) {
    return { ok: false, error: `Användarnamnet måste vara minst ${USERNAME_MIN} tecken.` };
  }
  if (value.length > USERNAME_MAX) {
    return { ok: false, error: `Användarnamnet får vara högst ${USERNAME_MAX} tecken.` };
  }
  if (!/^[a-zA-Z]/.test(value)) {
    return { ok: false, error: "Användarnamnet måste börja med en bokstav." };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return { ok: false, error: "Använd endast bokstäver (a–z), siffror och understreck." };
  }

  const normalized = normalize(value);

  if (RESERVED.includes(normalized)) {
    return { ok: false, error: "Det användarnamnet är reserverat. Välj ett annat." };
  }
  if (BANNED.some((word) => normalized.includes(word))) {
    return { ok: false, error: "Det användarnamnet är inte tillåtet. Välj ett annat." };
  }

  return { ok: true, value };
}
