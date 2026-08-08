import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";
import { InviteCode } from "@/components/leagues/InviteCode";
import { LeaveLeague } from "@/components/leagues/LeaveLeague";
import { OwnerActions } from "@/components/leagues/OwnerActions";
import { getCurrentUser } from "@/lib/supabase/server";
import { getLeagueWithMembers } from "@/lib/supabase/leagues";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

function joinedLabel(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

export default async function LigaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const result = await getLeagueWithMembers(id);

  // Finns inte, eller så har man inte tillgång till den.
  if (!result) notFound();

  const { league, members } = result;
  const isOwner = league.ownerId === user?.id;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/ligor"
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          ← Alla ligor
        </Link>
      </div>

      <PageHeader
        title={league.name}
        subtitle={`${league.memberCount} ${
          league.memberCount === 1 ? "medlem" : "medlemmar"
        } · tävlar i EM 2028`}
        action={isOwner ? <Badge tone="brand">Du äger ligan</Badge> : undefined}
      />

      {/* Bjud in */}
      <Card className="p-5">
        <h2 className="font-semibold text-ink">Bjud in vänner</h2>
        <p className="mt-1 text-sm text-muted">
          Dela koden — de anger den under &quot;Gå med i liga&quot;.
        </p>
        <div className="mt-3">
          <InviteCode code={league.inviteCode} />
        </div>
      </Card>

      <StubNotice>
        Poängkolumnen fylls när poängmotorn är byggd. Just nu visas medlemmarna i
        den ordning de gick med.
      </StubNotice>

      {/* Medlemmar / kommande topplista */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Medlemmar</h2>
        <Card>
          <div className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-faint">
            <span>#</span>
            <span>Spelare</span>
            <span className="text-right">Poäng</span>
          </div>
          <ul className="divide-y divide-border">
            {members.map((m, i) => {
              const isMe = m.userId === user?.id;
              return (
                <li
                  key={m.userId}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3",
                    isMe && "bg-brand/[0.06]",
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold text-muted">
                    {i + 1}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "truncate font-medium",
                        isMe ? "text-brand" : "text-ink",
                      )}
                    >
                      {m.username ? `@${m.username}` : "Namnlös spelare"}
                    </span>
                    {isMe && (
                      <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                        DU
                      </span>
                    )}
                    {m.isOwner && <Badge tone="muted">Ägare</Badge>}
                    <span className="shrink-0 text-xs text-faint">
                      med sedan {joinedLabel(m.joinedAt)}
                    </span>
                  </span>
                  <span className="text-right font-bold tabular-nums text-faint">—</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      {/* Ägarens val */}
      {isOwner && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Hantera ligan</h2>
          <Card className="p-5">
            <OwnerActions
              leagueId={league.id}
              leagueName={league.name}
              others={members
                .filter((m) => m.userId !== user?.id)
                .map((m) => ({ userId: m.userId, username: m.username }))}
            />
          </Card>
        </section>
      )}

      {user && !isOwner && (
        <div className="pt-2">
          <LeaveLeague leagueId={league.id} leagueName={league.name} />
        </div>
      )}
    </div>
  );
}
