import { createClient } from "@supabase/supabase-js";
import type { Tournament } from "@/lib/mock/data";

type Row = {
  id: string;
  name: string;
  short_name: string;
  type: string;
  host: string | null;
  starts_at: string;
  team_count: number;
  status: string;
};

/**
 * Hämtar turneringar från Supabase.
 * Returnerar null om nycklar saknas eller något går fel — då kan anroparen
 * falla tillbaka på mockdata så att appen aldrig kraschar.
 */
export async function getTournaments(): Promise<Tournament[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("tournaments")
      .select("id, name, short_name, type, host, starts_at, team_count, status")
      .order("starts_at", { ascending: true });

    if (error || !data || data.length === 0) return null;

    return (data as Row[]).map((r) => ({
      id: r.id,
      name: r.name,
      short: r.short_name,
      type: r.type as Tournament["type"],
      host: r.host ?? "",
      startsAt: r.starts_at,
      teamCount: r.team_count,
      status: r.status as Tournament["status"],
    }));
  } catch {
    return null;
  }
}
