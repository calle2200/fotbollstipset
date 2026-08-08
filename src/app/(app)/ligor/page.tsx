import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";
import { CreateLeagueForm, JoinLeagueForm } from "@/components/leagues/LeagueForms";
import { InviteCode } from "@/components/leagues/InviteCode";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyLeagues } from "@/lib/supabase/leagues";

export const dynamic = "force-dynamic";

export default async function LigorPage() {
  const user = await getCurrentUser();
  const leagues = await getMyLeagues(user?.id ?? null);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ligor"
        subtitle="Skapa en liga, bjud in vänner med en kod och tävla på en egen topplista."
      />

      {!user && (
        <div className="rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-sm text-muted">
          Du behöver ett konto för att skapa eller gå med i en liga.{" "}
          <Link href="/#logga-in" className="font-medium text-brand hover:underline">
            Logga in
          </Link>{" "}
          — det tar tio sekunder.
        </div>
      )}

      {/* Skapa / gå med */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <CreateLeagueForm disabled={!user} />
        </Card>
        <Card className="p-5">
          <JoinLeagueForm disabled={!user} />
        </Card>
      </div>

      <StubNotice>
        Ligorna fungerar på riktigt — men topplistan kan inte ranka på poäng
        förrän poängmotorn är byggd. Tills dess visas medlemmarna utan placering.
      </StubNotice>

      {/* Mina ligor */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Mina ligor</h2>
          {leagues.length > 0 && <Badge tone="muted">{leagues.length}</Badge>}
        </div>

        {leagues.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface/40 px-5 py-10 text-center">
            <p className="text-4xl">🏆</p>
            <p className="mt-3 font-medium text-ink">Du är inte med i någon liga än</p>
            <p className="mt-1 text-sm text-muted">
              {user
                ? "Skapa en egen och bjud in vännerna, eller gå med via en kod."
                : "Logga in för att skapa eller gå med i en liga."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((l) => (
              <Card key={l.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/ligor/${l.id}`}
                      className="truncate font-semibold text-ink transition-colors hover:text-brand"
                    >
                      {l.name}
                    </Link>
                    <p className="text-sm text-muted">
                      {l.memberCount} {l.memberCount === 1 ? "medlem" : "medlemmar"}
                    </p>
                  </div>
                  {l.ownerId === user?.id && <Badge tone="brand">Ägare</Badge>}
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-1.5 text-xs text-faint">Inbjudningskod</p>
                  <InviteCode code={l.inviteCode} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
