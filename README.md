# Pick'em — fotbollstips

Webbapp för fotbollstips på turneringar (VM/EM). Tippa 1X2 + exakt resultat,
gruppplaceringar och specialval, tävla i ligor och följ leaderboards.

> **Status: v0.1 — endast frontend-skal.** Denna session byggde projektsetup,
> navigering, layout och platshållarsidor. Auth, databas, API och poänglogik är
> medvetet stubbade och byggs i kommande sessioner.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (CSS-baserat tema i `globals.css`)
- Kommer senare: Supabase (auth/db/realtid), football-data.org (resultat), Vercel

## Kom igång

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produktionsbygge
```

## Struktur

```
src/
  app/
    page.tsx              Landning + login-platshållare (publik)
    (app)/                Route group med delad app-layout (header + mobil tab-bar)
      layout.tsx
      mitt-tips/          Fas 1: gruppmatcher, gruppplaceringar, specialval
      slutspel/           Fas 2: slutspelstips per runda
      matcher/            Matcher & resultat
      ligor/              Skapa/gå med + liga-leaderboard
      leaderboard/        Global leaderboard
      profil/             Profil & statistik
      admin/              Admin: reservinmatning + specialutfall
  components/
    layout/               Header, MobileTabBar, Logo, NavIcon
    ui/                   Card, Button, Badge, PageHeader, StubNotice
    tips/                 MatchCard (resultat- + tips-variant)
    leaderboard/          LeaderboardTable
  lib/
    nav.ts                En källa för navigeringen (desktop + mobil)
    cn.ts                 Klassnamn-hjälpare
    mock/data.ts          All mockdata (ersätts av Supabase/API senare)
```

## Design — "Pitch Night"

Mörkt, sportigt tema. Färger definieras som CSS-variabler i
`src/app/globals.css` (`--color-brand` lime, `--color-mint`, `--color-gold` m.fl.).

**Bakgrundsbild:** en neon-skyline ligger som ett band i toppen av vyn och
tonar ner till mörkt (viewport-fixed, syns på alla sidor). Just nu används en
platshållare, `public/pitch-city.svg`. Byt till en egen bild (t.ex. en
fotbolls­arena) genom att lägga den i `/public` och peka om `--bg-image` i
`src/app/globals.css` till filen — en gradient-overlay håller alltid texten
läsbar. Justera overlayens mörkhet i `body::before` vid behov.

> Flaggor visas som emoji-platshållare och kan renderas som landskoder på
> Windows. Byts mot riktiga flaggbilder (`flag_url`) senare.

## Stubbat (nästa sessioner)

Sök på `StubNotice` och `TODO (nästa session)` i koden. Bland annat:
magic link-auth, databas + RLS, resultathämtning via API, poängmotor,
fungerande ligor/inbjudningskoder och realtidsuppdaterade leaderboards.
