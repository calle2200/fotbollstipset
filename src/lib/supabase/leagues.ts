import { createSupabaseServerClient } from "@/lib/supabase/server";

export type League = {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  isPublic: boolean;
  memberCount: number;
};

export type LeagueMember = {
  userId: string;
  username: string | null;
  joinedAt: string;
  isOwner: boolean;
};

/** Ligorna den inloggade användaren är med i. Tom lista om utloggad. */
export async function getMyLeagues(userId: string | null): Promise<League[]> {
  if (!userId) return [];

  try {
    const supabase = await createSupabaseServerClient();

    // Vilka ligor är jag med i?
    const { data: memberships, error: mErr } = await supabase
      .from("league_members")
      .select("league_id")
      .eq("user_id", userId);
    if (mErr || !memberships?.length) return [];

    const ids = memberships.map((m) => m.league_id as string);

    const { data: leagues, error: lErr } = await supabase
      .from("leagues")
      .select("id, name, invite_code, owner_id, is_public")
      .in("id", ids);
    if (lErr || !leagues) return [];

    // Antal medlemmar per liga (RLS gör att vi bara ser våra egna ligor).
    const { data: allMembers } = await supabase
      .from("league_members")
      .select("league_id")
      .in("league_id", ids);

    const counts = new Map<string, number>();
    for (const row of allMembers ?? []) {
      const id = row.league_id as string;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    return leagues.map((l) => ({
      id: l.id as string,
      name: l.name as string,
      inviteCode: l.invite_code as string,
      ownerId: l.owner_id as string,
      isPublic: l.is_public as boolean,
      memberCount: counts.get(l.id as string) ?? 1,
    }));
  } catch {
    return [];
  }
}

/** En liga med dess medlemmar. null om den inte finns eller inte är åtkomlig. */
export async function getLeagueWithMembers(
  leagueId: string,
): Promise<{ league: League; members: LeagueMember[] } | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: league, error } = await supabase
      .from("leagues")
      .select("id, name, invite_code, owner_id, is_public")
      .eq("id", leagueId)
      .maybeSingle();
    if (error || !league) return null;

    const { data: memberRows } = await supabase
      .from("league_members")
      .select("user_id, joined_at")
      .eq("league_id", leagueId)
      .order("joined_at", { ascending: true });

    const userIds = (memberRows ?? []).map((m) => m.user_id as string);

    // Profiler är publikt läsbara, så vi kan hämta namnen.
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, username").in("id", userIds)
      : { data: [] as { id: string; username: string | null }[] };

    const nameById = new Map<string, string | null>(
      (profiles ?? []).map((p) => [p.id as string, (p.username as string) ?? null]),
    );

    const members: LeagueMember[] = (memberRows ?? []).map((m) => ({
      userId: m.user_id as string,
      username: nameById.get(m.user_id as string) ?? null,
      joinedAt: m.joined_at as string,
      isOwner: (m.user_id as string) === (league.owner_id as string),
    }));

    return {
      league: {
        id: league.id as string,
        name: league.name as string,
        inviteCode: league.invite_code as string,
        ownerId: league.owner_id as string,
        isPublic: league.is_public as boolean,
        memberCount: members.length,
      },
      members,
    };
  } catch {
    return null;
  }
}
