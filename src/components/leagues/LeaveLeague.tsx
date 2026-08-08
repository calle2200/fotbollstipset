"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LeaveLeague({
  leagueId,
  leagueName,
}: {
  leagueId: string;
  leagueName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setError("Du verkar inte vara inloggad längre.");
        return;
      }

      const { error: dbError } = await supabase
        .from("league_members")
        .delete()
        .eq("league_id", leagueId)
        .eq("user_id", userId);

      if (dbError) {
        console.error("Kunde inte lämna ligan:", dbError);
        setError("Kunde inte lämna ligan just nu.");
        return;
      }

      router.push("/ligor");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        Lämna ligan
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">Lämna {leagueName}?</span>
      <button
        type="button"
        onClick={leave}
        disabled={busy}
        className="inline-flex h-8 items-center rounded-full bg-pink px-3.5 text-sm font-semibold text-[#1a0410] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {busy ? "Lämnar…" : "Ja, lämna"}
      </button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Avbryt
      </Button>
      {error && <p className="w-full text-sm text-pink">{error}</p>}
    </div>
  );
}
