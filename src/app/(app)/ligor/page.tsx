import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StubNotice } from "@/components/ui/StubNotice";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { leagues, leagueLeaderboard } from "@/lib/mock/data";

export default function LigorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Ligor"
        subtitle="Skapa en liga, bjud in vänner med en kod och tävla på en egen topplista."
      />

      {/* Skapa / gå med */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold text-ink">Skapa liga</h3>
          <p className="mt-1 text-sm text-muted">
            Du blir ägare och får en inbjudningskod att dela.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              disabled
              placeholder="Liganamn"
              className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3.5 text-ink placeholder:text-faint focus:outline-none"
            />
            <Button disabled>Skapa</Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-ink">Gå med i liga</h3>
          <p className="mt-1 text-sm text-muted">Ange en inbjudningskod från en vän.</p>
          <div className="mt-4 flex gap-2">
            <input
              disabled
              placeholder="PICK-XXXX"
              className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3.5 font-mono uppercase text-ink placeholder:text-faint focus:outline-none"
            />
            <Button disabled variant="secondary">
              Gå med
            </Button>
          </div>
        </Card>
      </div>

      <StubNotice>
        Skapa/gå med, inbjudningskoder och medlemskap kräver databas och auth —
        byggs i nästa session.
      </StubNotice>

      {/* Mina ligor */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Mina ligor</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {leagues.map((l) => (
            <Card key={l.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{l.name}</h3>
                  <p className="text-sm text-muted">{l.members.toLocaleString("sv-SE")} medlemmar</p>
                </div>
                {l.isPublic ? <Badge tone="mint">Publik</Badge> : <Badge tone="muted">Privat</Badge>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted">Din placering</span>
                <span className="text-lg font-bold text-brand">#{l.myRank}</span>
              </div>
              <p className="mt-2 font-mono text-xs text-faint">Kod: {l.inviteCode}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Liga-leaderboard */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Liga-leaderboard</h2>
        <Card>
          <CardHeader title="Kontoret 2026" subtitle="Rankad på total turneringspoäng" />
          <LeaderboardTable rows={leagueLeaderboard} />
        </Card>
      </section>
    </div>
  );
}
