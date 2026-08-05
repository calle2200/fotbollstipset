import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { BallIcon, TrophyIcon, WhistleIcon } from "@/components/ui/Football";

export const metadata = {
  title: "Så funkar poängen — Pick'em",
  description:
    "Reglerna för Pick'em EM 2028: matchtips, specialval och hur poängen viktas mot hur många som tippat samma sak.",
};

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[var(--radius-card)] border border-border bg-surface/80 p-6 backdrop-blur-sm sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

export default function ReglerPage() {
  return (
    <div className="flex min-h-full flex-col">
      {/* Publik toppbar */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" />
          <ButtonLink href="/#logga-in" variant="outline" size="sm">
            Logga in
          </ButtonLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <div>
          <Badge tone="brand" className="mb-4">
            ⚽ EM 2028 · regler
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Så funkar poängen
          </h1>
          <p className="mt-3 text-lg text-muted">
            Du tippar matcher och gör några val för hela turneringen. Rätt svar
            ger poäng — men med en twist: <span className="text-ink">ju fler som
            tippat samma sak som du, desto mindre är tipset värt.</span> Vågar du
            pricka en outsider får du desto mer. Ingen matte krävs för att spela,
            men här är hela idén förklarad.
          </p>
        </div>

        {/* I korthet */}
        <SectionCard>
          <h2 className="mb-4 text-lg font-semibold text-ink">I korthet</h2>
          <ul className="space-y-2.5 text-muted">
            {[
              "Tippa varje match: vem vinner (1, X eller 2) och exakt resultat.",
              "Gör dina specialval för hela turneringen — vinnare, skyttekung med mera.",
              "Rätt svar ger grundpoäng, som sedan multipliceras.",
              "Populära tips ger mindre, modiga tips (outsiders) ger mer.",
              "Slutspelet väger tyngre ju längre in i turneringen du kommer.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1 text-brand">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Matchtips */}
        <SectionCard>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
              <BallIcon className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-semibold text-ink">Matchtips</h2>
          </div>

          <p className="text-muted">
            Varje match har två delar du kan få poäng på:
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-surface-2/50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink">Tecknet (1, X eller 2)</h3>
                <Badge tone="brand">10 poäng</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                Prickar du rätt på hemmaseger, oavgjort eller bortaseger får du
                grundpoängen.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink">Exakt resultat</h3>
                <Badge tone="brand">upp till 10 poäng</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                Du börjar på 10 poäng och tappar 2 för varje mål du är fel. Det
                räknas <span className="text-ink">bara om du fått tecknet rätt</span>,
                och kan aldrig bli minus.
              </p>
            </div>
          </div>

          {/* Exempeltabell: exakt resultat, facit 2–0 */}
          <p className="mt-6 mb-2 text-sm font-medium text-muted">
            Exempel — facit blir <span className="text-ink">2–0</span>:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-faint">
                  <th className="py-2 pr-4 font-medium">Ditt tips</th>
                  <th className="py-2 pr-4 font-medium">Rätt tecken?</th>
                  <th className="py-2 pr-4 font-medium">Mål fel</th>
                  <th className="py-2 text-right font-medium">Poäng (resultatdel)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["2–0", "Ja", "0", "10", true],
                  ["1–0", "Ja", "1", "8", false],
                  ["3–0", "Ja", "1", "8", false],
                  ["3–1", "Ja", "2", "6", false],
                  ["5–0", "Ja", "3", "4", false],
                  ["0–2", "Nej", "—", "0", false],
                  ["1–1", "Nej", "—", "0", false],
                ].map(([tip, sign, dev, pts, best]) => (
                  <tr key={tip as string} className={best ? "text-brand" : "text-muted"}>
                    <td className="py-2 pr-4 font-medium">{tip}</td>
                    <td className="py-2 pr-4">{sign}</td>
                    <td className="py-2 pr-4">{dev}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">{pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-faint">
            Både tecken- och resultatdelen multipliceras sedan med matchens
            multiplikator (mer om det längre ner).
          </p>
        </SectionCard>

        {/* Slutspelet */}
        <SectionCard>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/15 text-violet">
              <WhistleIcon className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-semibold text-ink">Slutspelet väger tyngre</h2>
          </div>
          <p className="text-muted">
            I slutspelet gäller samma poäng som i gruppspelet, men allt
            multipliceras extra ju längre in i turneringen matchen ligger:
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Åttondel", "×1"],
              ["Kvartsfinal", "×1,25"],
              ["Semifinal", "×1,5"],
              ["Final", "×2"],
            ].map(([round, factor]) => (
              <div key={round} className="rounded-xl border border-border bg-surface-2/50 p-3 text-center">
                <div className="text-xl font-bold text-brand">{factor}</div>
                <div className="text-xs text-muted">{round}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 text-sm text-muted">
            <p>
              <span className="font-medium text-ink">Vem går vidare?</span> Tippar
              du oavgjort (X) väljer du också vilket lag som tar sig vidare. Det är
              ett eget delmoment värt <span className="text-ink">8 poäng</span>.
            </p>
            <p>
              <span className="font-medium text-ink">Tecknet gäller efter 90 minuter.</span>{" "}
              Avgörs matchen på straffar räknas det inte för tecknet — men ditt val
              av vem som går vidare kan ändå ge poäng.
            </p>
          </div>
        </SectionCard>

        {/* Specialval */}
        <SectionCard>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <TrophyIcon className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-semibold text-ink">Specialval</h2>
          </div>
          <p className="text-muted">
            Innan turneringen börjar gör du ett antal val för hela EM:et. De är
            värda mycket mer än en enskild match — här ligger de stora poängen.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-faint">
                  <th className="py-2 pr-4 font-medium">Val</th>
                  <th className="py-2 pr-4 font-medium">Vad du tippar</th>
                  <th className="py-2 text-right font-medium">Grundpoäng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted">
                {[
                  ["Turneringsvinnare", "Vem vinner hela EM:et", "100"],
                  ["Topp fyra", "Tre lag du tror når semifinal (poäng per rätt)", "60 / lag"],
                  ["Skyttekung", "Vem gör flest mål", "90"],
                  ["Flest assist", "Vem lägger flest målgivande passningar", "80"],
                  ["Land med flest mål", "Vilket land som gör flest mål totalt", "60"],
                  ["Första målet", "Vilket land som gör turneringens första mål", "20"],
                ].map(([name, what, pts]) => (
                  <tr key={name}>
                    <td className="py-2.5 pr-4 font-medium text-ink">{name}</td>
                    <td className="py-2.5 pr-4">{what}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums text-ink">{pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-faint">
            Alla specialval multipliceras precis som matchtipsen. Ett tips står
            kvar även om t.ex. en spelare skadas innan turneringen — det är en del
            av risken.
          </p>
        </SectionCard>

        {/* Multiplikatorn */}
        <SectionCard className="border-brand/30">
          <h2 className="text-xl font-bold text-ink">
            Multiplikatorn — det som gör tipset speciellt
          </h2>
          <div className="mt-3 space-y-3 text-muted">
            <p>
              Grundpoängen är bara halva historien. Varje rätt tips multipliceras
              med ett tal som beror på{" "}
              <span className="text-ink">hur många andra som tippade likadant</span>.
            </p>
            <ul className="space-y-2">
              <li className="flex gap-3">
                <span className="mt-1 text-pink">↓</span>
                <span>
                  Valde nästan alla samma sak som du? Då var det inte modigt — och
                  multiplikatorn blir låg. Att pricka en storfavorit kan till och med
                  ge <span className="text-ink">mindre</span> än grundpoängen.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-brand">↑</span>
                <span>
                  Var du nästan ensam om ett tips som slog in? Då belönas modet med
                  en hög multiplikator.
                </span>
              </li>
            </ul>
            <p>
              Det finns ett <span className="text-ink">golv</span> (en favorit är
              alltid värd något) och ett <span className="text-ink">tak</span> (en
              outsider kan inte bli oändligt värd). Och är ni bara några få som
              spelar spelar fördelningen ingen roll — då ger alla tips vanlig
              grundpoäng, eftersom procent på en handfull personer bara är slump.
            </p>
          </div>

          {/* Exempel 1 — litet fält, en match */}
          <div className="mt-6">
            <h3 className="font-semibold text-ink">Exempel 1: en match, 10 spelare</h3>
            <p className="mt-1 text-sm text-muted">
              8 av 10 tror på hemmaseger. Två vågar något annat. Matchen är värd 10
              i grundpoäng.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-faint">
                    <th className="py-2 pr-4 font-medium">Tips</th>
                    <th className="py-2 pr-4 font-medium">Så många valde det</th>
                    <th className="py-2 pr-4 font-medium">Multiplikator</th>
                    <th className="py-2 text-right font-medium">Poäng om rätt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="text-muted">
                    <td className="py-2.5 pr-4 font-medium">Hemmaseger (1)</td>
                    <td className="py-2.5 pr-4">8 av 10</td>
                    <td className="py-2.5 pr-4 tabular-nums">×0,89</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">8,9</td>
                  </tr>
                  <tr className="text-brand">
                    <td className="py-2.5 pr-4 font-medium">Oavgjort (X)</td>
                    <td className="py-2.5 pr-4">1 av 10</td>
                    <td className="py-2.5 pr-4 tabular-nums">×2,11</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">21,1</td>
                  </tr>
                  <tr className="text-brand">
                    <td className="py-2.5 pr-4 font-medium">Bortaseger (2)</td>
                    <td className="py-2.5 pr-4">1 av 10</td>
                    <td className="py-2.5 pr-4 tabular-nums">×2,11</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">21,1</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-faint">
              Favoriten ger 8,9 — mindre än grundpoängen. Den som vågade och prickade
              rätt får mer än dubbelt så mycket.
            </p>
          </div>

          {/* Exempel 2 — stort fält, specialval */}
          <div className="mt-8">
            <h3 className="font-semibold text-ink">
              Exempel 2: turneringsvinnare, 200 spelare
            </h3>
            <p className="mt-1 text-sm text-muted">
              Många samlas på favoriten, ett fåtal chansar på en outsider. Grundpoängen
              för vinnare är 100.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-faint">
                    <th className="py-2 pr-4 font-medium">Tippat lag</th>
                    <th className="py-2 pr-4 font-medium">Så många valde det</th>
                    <th className="py-2 pr-4 font-medium">Multiplikator</th>
                    <th className="py-2 text-right font-medium">Poäng om rätt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="text-muted">
                    <td className="py-2.5 pr-4 font-medium">Storfavoriten</td>
                    <td className="py-2.5 pr-4">100 av 200</td>
                    <td className="py-2.5 pr-4 tabular-nums">×0,87</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">86,7</td>
                  </tr>
                  <tr className="text-muted">
                    <td className="py-2.5 pr-4 font-medium">Näst populärast</td>
                    <td className="py-2.5 pr-4">60 av 200</td>
                    <td className="py-2.5 pr-4 tabular-nums">×1,12</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">111,7</td>
                  </tr>
                  <tr className="text-muted">
                    <td className="py-2.5 pr-4 font-medium">Mörk häst</td>
                    <td className="py-2.5 pr-4">38 av 200</td>
                    <td className="py-2.5 pr-4 tabular-nums">×1,40</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">140,0</td>
                  </tr>
                  <tr className="text-brand">
                    <td className="py-2.5 pr-4 font-medium">Outsidern</td>
                    <td className="py-2.5 pr-4">2 av 200</td>
                    <td className="py-2.5 pr-4 tabular-nums">×2,91 (taket)</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">291,3</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-faint">
              Ju färre som trodde på laget, desto större multiplikator — ända upp till
              taket. Att pricka outsidern var här värt över tre gånger så mycket som
              favoriten.
            </p>
          </div>
        </SectionCard>

        {/* Låsning & rättvisa */}
        <SectionCard>
          <h2 className="mb-3 text-lg font-semibold text-ink">När tipsen låser</h2>
          <div className="space-y-2.5 text-muted">
            <p>
              <span className="font-medium text-ink">Matchtips</span> låser när
              matchen börjar. <span className="font-medium text-ink">Specialval</span>{" "}
              låser när turneringens allra första match sparkar igång.
            </p>
            <p>
              Multiplikatorerna räknas ut och <span className="text-ink">fryses</span> i
              samma stund tipset låser. De påverkas alltså inte av vad folk gör efteråt
              — din poäng ligger fast.
            </p>
            <p>
              För att hålla det rättvist ser du{" "}
              <span className="text-ink">inte</span> exakt hur andra tippat innan
              låsning (bara en vink som ”ovanligt tips” eller ”de flesta tycker som
              du”). Annars skulle folk kunna jaga höga multiplikatorer i sista sekunden
              istället för att tippa på riktigt. De exakta siffrorna visas när allt är
              låst.
            </p>
          </div>
        </SectionCard>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <p className="text-muted">Redo att lägga ditt tips?</p>
          <ButtonLink href="/#logga-in" size="lg" className="neon-glow">
            Kom igång
          </ButtonLink>
          <Link
            href="/turneringar"
            className="text-sm text-faint underline-offset-4 transition-colors hover:text-muted hover:underline"
          >
            eller titta runt som gäst
          </Link>
        </div>
      </main>

      <footer className="field-stripes border-t border-border py-6 text-center text-sm text-faint">
        Pick'em · EM 2028
      </footer>
    </div>
  );
}
