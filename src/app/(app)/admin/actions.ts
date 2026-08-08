"use server";

import { revalidatePath } from "next/cache";
import { isCurrentUserAdmin } from "@/lib/supabase/server";
import { settleMatch } from "@/lib/scoring/settle";
import type { Stage } from "@/lib/scoring/engine";

export type ActionState = {
  ok: boolean;
  message: string;
  matchId?: string;
} | null;

const VALID_STAGES: Stage[] = ["group", "r16", "qf", "sf", "final"];

/**
 * Matar in ett resultat och räknar ut poäng för matchen.
 *
 * Server-funktioner går att nå via direkta POST-anrop, inte bara via vårt
 * gränssnitt — därför kontrolleras admin-behörigheten här inne, inte bara
 * genom att sidan är låst.
 */
export async function settleMatchAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isCurrentUserAdmin())) {
    return { ok: false, message: "Du har inte behörighet att göra det." };
  }

  const matchId = String(formData.get("matchId") ?? "");
  const stageRaw = String(formData.get("stage") ?? "group");
  const home = Number(formData.get("home"));
  const away = Number(formData.get("away"));

  if (!matchId) {
    return { ok: false, message: "Match saknas." };
  }
  if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
    return { ok: false, message: "Fyll i giltiga mål (0 eller mer).", matchId };
  }
  if (home > 30 || away > 30) {
    return { ok: false, message: "Det där ser inte ut som ett fotbollsresultat.", matchId };
  }

  const stage = (VALID_STAGES as string[]).includes(stageRaw)
    ? (stageRaw as Stage)
    : "group";

  const result = await settleMatch({
    matchId,
    actual: { home, away },
    stage,
  });

  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/leaderboard");
    revalidatePath("/matcher");
    revalidatePath("/ligor");
  }

  const detail =
    result.ok && result.multipliers
      ? ` Multiplikatorer: ${Object.entries(result.multipliers)
          .map(([o, m]) => `${o}=${m.toFixed(2)}`)
          .join(", ")}.`
      : "";

  return { ok: result.ok, message: result.message + detail, matchId };
}
