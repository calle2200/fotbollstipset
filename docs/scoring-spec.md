# Poängsystem — EM 2028-tipset

Teknisk specifikation för implementation. Skriven för att kunna läsas av en
utvecklare eller en kodassistent utan ytterligare kontext.

Stack (antagen): Next.js / TypeScript / Supabase (Postgres) / Vercel.

---

## 1. Bakgrund och mål

Tipset körs på fotbolls-EM 2028: 24 lag, 36 gruppspelsmatcher, 15 slutspelsmatcher
(åttondel 8, kvart 4, semi 2, final 1). Deltagarna tippar matchresultat samt ett
antal specialval för hela turneringen.

Det som skiljer det här systemet från ett vanligt tipsspel är att **poängen viktas
mot hur många andra som tippade samma sak**. Att sätta favoriten ska ge mindre än
grundpoängen, att pricka en outsider ska ge mer. Modellen är i praktiken parimutuel
— samma princip som odds på trav — men dämpad så att enstaka lyckoträffar inte
avgör hela turneringen.

Väntat deltagarantal: minst 10, potentiellt betydligt fler. Systemet måste fungera
rimligt över hela det spannet utan manuell omkonfiguration.

---

## 2. Kärnbegrepp: marknad

En **marknad** är en samling ömsesidigt uteslutande alternativ som deltagarna
väljer mellan. Varje marknad får sin egen andelsfördelning och sina egna
multiplikatorer.

| Marknad | Alternativ | Val per spelare |
|---|---|---|
| `match_1x2:<match_id>` | 1, X, 2 | 1 |
| `match_score:<match_id>` | exakt resultat (fri sträng, t.ex. `2-1`) | 1 |
| `advance:<match_id>` | de två lagen (endast slutspel) | 1 |
| `winner` | 24 lag | 1 |
| `top4` | 24 lag | 3 |
| `topscorer` | spelarpool | 1 |
| `topassists` | spelarpool | 1 |
| `bestgk` | spelarpool | 1 |
| `mostgoals` | 24 lag | 1 |
| `firstgoal` | 24 lag | 1 |

---

## 3. Riskmultiplikatorn

### 3.1 Formel

För en marknad där varje spelare gör `s` val (`s = 1` utom för `top4` där `s = 3`):

```
N      = antal spelare som lämnat in val i denna marknad
K      = antal distinkta alternativ som minst en spelare valde
n_i    = antal spelare som valde alternativ i
k      = 0.5                        (Laplace-smoothing)

p_i    = (n_i + k) / (s·N + k·K)    andelar, summerar till 1
H      = Σ p_j²                     marknadens koncentration
M_i    = clamp( (H / p_i)^α , M_min , M_max )
```

Poäng för ett korrekt val: `baspoäng × M_i`, avrundat till en decimal.

### 3.2 Parametrar

| Parameter | Värde | Kommentar |
|---|---|---|
| `α` (RISK_ALPHA) | `0.5` | Riskratten. `1.0` = full parimutuel (för brutalt), `0.5` = lagom. Enda parametern du ska laborera med efter simulering. |
| `k` (SMOOTHING) | `0.5` | Förhindrar division med noll och dämpar brus vid små fält. Effekten försvinner naturligt när N växer. |
| `M_min` | `0.6` | Golv. Att pricka en storfavorit ska fortfarande vara värt något. |
| `M_max` | dynamiskt, se 3.3 | Tak. |
| `cap_factor` | `1.0` matcher, `0.75` specialval | Per marknad, kolumn i `markets`. Skalar taket. Se 3.3. |
| `MIN_PLAYERS` | `4` | Under detta: `M_i = 1.0` för alla. Procent på tre spelare är brus. |

### 3.3 Dynamiskt tak

```
M_max(N, f) = f · clamp( 1.5 + 0.45 · ln(N) , 2.0 , 4.0 )
```

`f` är marknadens `cap_factor`. Faktorn appliceras **efter** clampen, så att
specialval alltid ligger på en fast andel av matchtaket.

| N | `f = 1.0` (matcher) | `f = 0.75` (specialval) |
|---|---|---|
| 4 | 2,12 | 1,59 |
| 10 | 2,54 | 1,90 |
| 25 | 2,95 | 2,21 |
| 50 | 3,26 | 2,45 |
| 100 | 3,57 | 2,68 |
| 250 | 3,98 | 2,99 |
| 500+ | 4,00 | 3,00 |

Motiveringen: med tio spelare är den minsta möjliga andelen 10 % och råformeln kan
aldrig producera extremvärden — taket binder knappt. Med tusen spelare är ett
0,2 %-tips genuint mycket modigare och förtjänar mer, men variansen måste ändå
hållas i schack. Logaritmen ger den kurvan.

**`N` är antalet spelare som faktiskt lämnat val i den specifika marknaden**, inte
antalet registrerade konton. En spelare som missar en match ska inte påverka
multiplikatorerna för de som tippade den.

Motiveringen till `cap_factor`: specialvalen har baspoäng på 60–100 mot matchernas
10, så samma tak ger dem betydligt större absolut genomslag. Med `f = 1.0` och 200
deltagare kan en longshot på skyttekungen ge `90 × 3,88 ≈ 349` poäng — ungefär en
femtedel av hela turneringens poängbudget från ett enda kryss. Med `f = 0.75`
landar samma tips på 262, vilket är rejält men inte turneringsavgörande.

Vid små fält binder taket knappt alls, så faktorn saknar praktisk betydelse under
ungefär 30 deltagare. Den är en säkerhetsventil för när tipset växer, inte något
som märks i en kompisliga på tio.

### 3.4 Varför `H` som referenspunkt

`H = Σ p²` (Herfindahl-index) mäter hur koncentrerad marknaden är. Genom att
normalisera mot `H` istället för en fast referens blir multiplikatorn
självjusterande:

- **Jämn marknad** (alla tippar olika) → `H` lågt → alla multiplikatorer nära 1.
  Korrekt: att chansa på en jämn match är inte modigt.
- **Koncentrerad marknad** (alla på favoriten) → `H` högt → outsidern belönas
  rejält, favoriten straffas milt.

Det gör också att fältets snittmultiplikator hamnar nära 1 oavsett marknadstyp,
vilket håller den totala poängbudgeten stabil.

### 3.5 Referensimplementation

```ts
export const RISK_ALPHA = 0.5;
export const SMOOTHING = 0.5;
export const M_MIN = 0.6;
export const MIN_PLAYERS = 4;

export function maxMultiplier(playerCount: number, capFactor = 1.0): number {
  const base = Math.min(4.0, Math.max(2.0, 1.5 + 0.45 * Math.log(playerCount)));
  return base * capFactor;
}

/**
 * @param counts       alternativ -> antal spelare som valde det
 * @param playerCount  antal spelare som lämnat val i marknaden (N)
 * @param picksPerPlayer  antal val per spelare (s), 1 utom för top4
 * @param capFactor    marknadens cap_factor: 1.0 matcher, 0.75 specialval
 * @returns alternativ -> multiplikator
 */
export function riskMultipliers(
  counts: Record<string, number>,
  playerCount: number,
  picksPerPlayer = 1,
  capFactor = 1.0,
): Record<string, number> {
  const options = Object.keys(counts);

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
```

---

## 4. Poängregler

### 4.1 Gruppspelsmatch

Två separata delmoment per match.

**Tecken (1X2)** — baspoäng `10`, multiplikator från marknaden `match_1x2`.

**Exakt resultat** — baspoäng `10`, minus `2` per mål avvikelse:

```
deviation = |predHome - actualHome| + |predAway - actualAway|
raw       = max(0, 10 - 2 * deviation)
```

Konfigflagga `SCORE_REQUIRES_CORRECT_1X2 = true` (default): resultatdelen betalar
bara ut om tecknet är rätt. Utan den gaten ger tipset 1-0 på facit 0-2 fyra poäng
trots fel tecken, vilket är för generöst. Sätt flaggan till `false` om ni hellre
vill ha rena avståndspoäng — men golva alltid på 0.

**Multiplikator för resultatdelen:** i v1, återanvänd multiplikatorn från
`match_1x2`. En separat multiplikator på resultatfördelningen är teoretiskt renare
men kräver tyngre smoothing eftersom 1-0 och 2-1 äter upp halva fältet.
`match_score`-marknaden finns med i datamodellen för att kunna aktiveras senare —
implementera inte poängsättning på den nu.

Notera en positiv bieffekt: `-2 per mål` straffar i sig den som vågar tippa 3-2
hårdare än den som lägger sig på 1-0, eftersom maximal avvikelse är större.
Riskmultiplikatorn motverkar detta.

### 4.2 Slutspelsmatch

Samma som gruppspel, plus:

**Rundstege** — multipliceras ovanpå riskmultiplikatorn på matchens alla delmoment:

| Runda | Faktor |
|---|---|
| Åttondelsfinal | 1,00 |
| Kvartsfinal | 1,25 |
| Semifinal | 1,50 |
| Final | 2,00 |

Utan detta blir 36 gruppspelsmatcher oproportionerligt tunga jämfört med de 15
matcher som faktiskt avgör turneringen.

**Avancemang** — spelare som tippar X måste även välja vilket lag som går vidare.
Eget delmoment, baspoäng `8`, egen marknad `advance:<match_id>` som inkluderar
alla spelares avancemangsval (även de som implicit följer av ett 1- eller
2-tips — annars blir andelarna missvisande).

1X2 avser **full tid (90 min)**. Ett tips på 1 som slutar med hemmaseger efter
straffar ger alltså 0 på teckendelen men rätt på avancemangsdelen. Detta måste
kommuniceras tydligt i UI:t.

### 4.3 Specialval

| Marknad | Baspoäng | Val | Kommentar |
|---|---|---|---|
| `winner` | 100 | 1 | |
| `top4` | 60 per träff | 3 | se nedan |
| `topscorer` | 90 | 1 | |
| `topassists` | 80 | 1 | |
| `bestgk` | 70 | 1 | |
| `mostgoals` | 60 | 1 | flest gjorda mål i hela turneringen |
| `firstgoal` | 20 | 1 | landet som gör turneringens första mål |

Alla får riskmultiplikator enligt avsnitt 3.

**`top4` i detalj.** Spelaren väljer tre lag utöver sitt `winner`-tips. Låt `S` vara
mängden semifinalister (4 lag). Varje top4-val ger `60 × M` om laget finns i `S`
och inte är samma lag som spelarens `winner`-tips. Ordningen spelar ingen roll.
Eftersom `s = 3` normaliseras andelarna med `3·N` i nämnaren (se 3.1), så att de
summerar till 1 och formeln fungerar oförändrat.

**Delade titlar** (två spelare på samma antal mål i skytteligan): full poäng till
alla som tippat någon av dem. Alternativet — proportionell delning — är svårare att
förklara och gör lite skillnad i praktiken.

**Spelare som inte kommer till spel** (skadad före turneringen): tipset står kvar
och ger 0. Ingen omtippning. Detta är en del av risken.

---

## 5. Timing och låsning

| Marknad | Låses |
|---|---|
| Alla specialval | vid första matchens avspark |
| Gruppspelsmatch | vid respektive avspark |
| Slutspelsmatch | vid respektive avspark (lottas fram efterhand) |

**Andelarna beräknas vid låsning och fryses.** Multiplikatorn för en match är
baserad på de val som fanns när matchen började — inte på hur fältet ser ut senare.

**Visa inte andelarna före låsning.** Om spelarna ser fördelningen live kommer några
att sitta och snipa kontrarian-tips i sista sekunden — inte för att de tror på
utfallet utan för att multiplikatorn är hög. Det urholkar hela poängen med
systemet. På specialvalen, som låses en enda gång vid turneringsstart, är det
särskilt skadligt.

Vill man ha spänningen kan UI:t visa en luddig indikator (`ovanligt tips`,
`de flesta tycker som du`) istället för exakta procentsatser. Exakta andelar och
multiplikatorer visas efter låsning.

---

## 6. Datamodell (förslag)

```sql
create table markets (
  id            text primary key,          -- 'match_1x2:42', 'topscorer'
  kind          text not null,             -- 'match_1x2' | 'top4' | ...
  picks_per_player int not null default 1,
  locks_at      timestamptz not null,
  locked_at     timestamptz,
  settled_at    timestamptz,
  round_factor  numeric not null default 1.0,
  cap_factor    numeric not null default 1.0,   -- 0.75 för specialval
  base_points   numeric not null
);

create table picks (
  id         uuid primary key default gen_random_uuid(),
  market_id  text not null references markets(id),
  user_id    uuid not null references auth.users(id),
  option     text not null,               -- 'X', 'SWE', 'mbappe', '2-1'
  created_at timestamptz not null default now(),
  unique (market_id, user_id, option)
);

-- Fryst ögonblicksbild vid låsning. Skrivs en gång, ändras aldrig.
create table market_multipliers (
  market_id    text not null references markets(id),
  option       text not null,
  player_count int not null,              -- N vid låsning
  pick_count   int not null,              -- n_i vid låsning
  share        numeric not null,          -- p_i
  multiplier   numeric not null,          -- M_i
  computed_at  timestamptz not null default now(),
  primary key (market_id, option)
);

-- Fryst poäng. Räknas aldrig om.
create table awards (
  id           uuid primary key default gen_random_uuid(),
  market_id    text not null references markets(id),
  user_id      uuid not null references auth.users(id),
  component    text not null,             -- '1x2' | 'score' | 'advance' | 'outright'
  base_points  numeric not null,
  multiplier   numeric not null,
  round_factor numeric not null,
  points       numeric not null,          -- det som räknas i tabellen
  awarded_at   timestamptz not null default now(),
  unique (market_id, user_id, component)
);
```

**Kritiskt:** `multiplier` och `points` sparas som kolumner när marknaden avgörs och
räknas aldrig om. Om de beräknades on-the-fly skulle ställningen ändras retroaktivt
varje gång en ny spelare registrerar sig. `unique`-constrainten på `awards` gör
avgörandet idempotent — en omkörning av settlementjobbet får inte dubbla poäng.

---

## 7. Testfall

Implementationen ska verifieras mot dessa. Toleransen är ±0,001.

### 7.1 Litet fält, koncentrerad marknad

```
N = 10, s = 1, counts = { "1": 8, "X": 1, "2": 1 }
K = 3, denom = 10 + 0.5·3 = 11.5

p(1) = 8.5/11.5 = 0.739130
p(X) = 1.5/11.5 = 0.130435
p(2) = 1.5/11.5 = 0.130435
H    = 0.580340
M_max(10) = 2.5363

M(1) = sqrt(0.580340/0.739130) = 0.886097
M(X) = sqrt(0.580340/0.130435) = 2.109332
M(2) = 2.109332
```

Rätt tecken på `X` ger `10 × 2.1093 = 21.1` poäng.

### 7.2 Stort fält, taket binder

```
N = 200, s = 1, counts = { "A": 100, "B": 60, "C": 38, "D": 2 }
K = 4, denom = 200 + 2 = 202

p(A) = 0.497525,  p(B) = 0.299505
p(C) = 0.190594,  p(D) = 0.012376
H    = 0.373713
M_max(200) = 1.5 + 0.45·ln(200) = 3.8842

M(A) = sqrt(0.373713/0.497525) = 0.866715
M(D) = sqrt(0.373713/0.012376) = 5.4951  ->  kapas till 3.8842
```

Samma marknad med `cap_factor = 0.75` (specialval):

```
M_max(200, 0.75) = 3.8842 · 0.75 = 2.9132
M(A) = 0.866715   (opåverkad, taket binder inte)
M(D) = 2.9132
```

### 7.3 Under tröskeln

```
N = 3  ->  alla multiplikatorer = 1.0
```

### 7.4 Exakt resultat

Med `SCORE_REQUIRES_CORRECT_1X2 = true`, facit `2-0`:

| Tips | Tecken | Avvikelse | Resultatdel (rå) |
|---|---|---|---|
| 2-0 | rätt | 0 | 10 |
| 1-0 | rätt | 1 | 8 |
| 3-0 | rätt | 1 | 8 |
| 3-1 | rätt | 2 | 6 |
| 5-0 | rätt | 3 | 4 |
| 0-2 | fel | — | 0 |
| 1-1 | fel | — | 0 |

### 7.5 Egenskaper (property-based, valfritt men rekommenderat)

- Andelarna summerar alltid till 1 (inom flyttalstolerans).
- Alla multiplikatorer ligger inom `[M_min, M_max(N)]`.
- Multiplikatorn är strikt avtagande i `p_i`.
- I en perfekt jämn marknad är alla multiplikatorer exakt 1,0.

---

## 8. Balansering

Grov poängbudget:

| Del | Baspoäng |
|---|---|
| 36 gruppmatcher × (10 + 10) | 720 |
| 15 slutspelsmatcher × (10 + 10 + 8) × rundstege | ~500 |
| Specialval (100 + 3×60 + 90 + 80 + 70 + 60 + 20) | 600 |

Specialvalen ska betyda mycket men inte äga tipset. Fördelningen ovan är ungefär
rätt.

**Simulera innan lansering.** Skriv ett skript som genererar 100 syntetiska spelare
med realistiska tippmönster (majoriteten följer favoriter, en minoritet chansar),
kör igenom en slumpad turnering några tusen gånger och mät:

1. Hur ofta avgörs segern av ett enda longshot-tips (>15 % av vinnarens totalpoäng
   från en enskild träff)?
2. Vad är spridningen mellan vinnare och median?
3. Korrelerar slutplacering med antal rätt, eller bara med tur?

Om (1) överstiger ~30 %: **justera taken, inte `α`.** Alfa styr formens lutning och
är det som gör systemet rättvist. Taken är det som styr variansen. Sänk i första
hand `cap_factor` på specialvalen (0,75 → 0,6), eftersom det oftast är där de
turneringsavgörande utfallen uppstår. Rör den globala `M_max`-formeln sist.

Kör simuleringen för flera fältstorlekar — minst 10, 50 och 200 deltagare. Taken
beter sig olika i de spannen och en inställning som fungerar för en kompisliga kan
vara helt fel för ett öppet tips.

---

## 9. Öppna beslut

Dessa är inte fastställda och bör bekräftas innan implementation:

1. **Skyttekung — vad räknas?** Endast mål, eller mål med assist som skiljekriterium
   (UEFA:s officiella regel)? Påverkar hur `topscorer` avgörs.
2. **Bästa målvakt** — UEFA utser detta subjektivt. Alternativ: låt turneringens
   officiella utmärkelse gälla, eller definiera ett objektivt kriterium (flest
   nollor) i förväg. Objektivt är att föredra för att undvika diskussion.
3. **Sena anmälningar** — får spelare gå med efter turneringsstart? Om ja: de kan
   inte tippa specialval eller redan spelade matcher, och deras val ska inte
   påverka redan frysta multiplikatorer.
4. **Uteblivna tips** — 0 poäng, eller automatiskt favorittips? Rekommendation: 0
   poäng, men skicka påminnelse innan låsning.
