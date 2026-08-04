import { createClient } from "@supabase/supabase-js";
import type { Match, Team } from "@/lib/mock/data";

type TeamRow = { id: string; name: string; code: string; flag: string | null; group_label: string };
type MatchRow = {
  id: string;
  stage: string;
  group_label: string | null;
  home_team_id: string;
  away_team_id: string;
  kickoff: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
};

/**
 * Hämtar matcher (med lag) från Supabase.
 * Returnerar null om nycklar saknas eller något går fel — anroparen faller då
 * tillbaka på mockdata så appen aldrig kraschar.
 */
export async function getMatches(): Promise<Match[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key);

    const [teamsRes, matchesRes] = await Promise.all([
      supabase.from("teams").select("id, name, code, flag, group_label"),
      supabase
        .from("matches")
        .select("id, stage, group_label, home_team_id, away_team_id, kickoff, status, home_score, away_score")
        .order("kickoff", { ascending: true }),
    ]);

    if (teamsRes.error || matchesRes.error) return null;
    const teamRows = teamsRes.data as TeamRow[] | null;
    const matchRows = matchesRes.data as MatchRow[] | null;
    if (!teamRows || !matchRows || matchRows.length === 0) return null;

    const teamById = new Map<string, Team>(
      teamRows.map((t) => [
        t.id,
        { id: t.id, name: t.name, code: t.code, flag: t.flag ?? "", group: t.group_label },
      ]),
    );

    const matches: Match[] = [];
    for (const m of matchRows) {
      const home = teamById.get(m.home_team_id);
      const away = teamById.get(m.away_team_id);
      if (!home || !away) continue; // hoppa över om ett lag saknas

      matches.push({
        id: m.id,
        stage: m.stage as Match["stage"],
        group: m.group_label ?? undefined,
        home,
        away,
        kickoff: m.kickoff,
        status: m.status as Match["status"],
        homeScore: m.home_score ?? undefined,
        awayScore: m.away_score ?? undefined,
      });
    }

    return matches;
  } catch {
    return null;
  }
}
