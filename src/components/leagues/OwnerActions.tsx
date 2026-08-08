"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Member = { userId: string; username: string | null };

function friendlyError(message: string): string {
  if (message.includes("NOT_OWNER")) return "Bara ägaren kan göra det.";
  if (message.includes("NOT_A_MEMBER")) return "Personen är inte medlem i ligan.";
  if (message.includes("ALREADY_OWNER")) return "Du är redan ägare.";
  if (message.includes("NOT_LOGGED_IN")) return "Du måste vara inloggad.";
  return "Något gick fel. Försök igen.";
}

/** Ägarens val: överlåt ägarskapet eller radera ligan helt. */
export function OwnerActions({
  leagueId,
  leagueName,
  others,
}: {
  leagueId: string;
  leagueName: string;
  /** Övriga medlemmar (alla utom ägaren själv). */
  others: Member[];
}) {
  const router = useRouter();
  const [newOwner, setNewOwner] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alone = others.length === 0;

  async function transfer() {
    if (!newOwner) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: rpcError } = await supabase.rpc("transfer_league_ownership", {
        p_league_id: leagueId,
        p_new_owner: newOwner,
      });
      if (rpcError) {
        setError(friendlyError(rpcError.message ?? ""));
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeLeague() {
    if (confirmName.trim() !== leagueName) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // Säkerhetsregeln tillåter bara ägaren att radera.
      const { error: dbError } = await supabase.from("leagues").delete().eq("id", leagueId);
      if (dbError) {
        console.error("Kunde inte radera ligan:", dbError);
        setError("Kunde inte radera ligan just nu.");
        return;
      }
      router.push("/ligor");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Överlåt ägarskap */}
      <div>
        <p className="font-medium text-ink">Överlåt ägarskap</p>
        <p className="mt-1 text-sm text-muted">
          {alone
            ? "Du är ensam medlem — det finns ingen att lämna över till än."
            : "Gör någon annan till ägare. Sen kan du lämna ligan som vanligt."}
        </p>
        {!alone && (
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm text-ink focus:border-brand/50 focus:outline-none"
            >
              <option value="">Välj medlem…</option>
              {others.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.username ? `@${m.username}` : "Namnlös spelare"}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={transfer} disabled={busy || !newOwner}>
              {busy ? "Överlåter…" : "Överlåt"}
            </Button>
          </div>
        )}
      </div>

      {/* Radera ligan */}
      <div className="border-t border-border pt-5">
        {!deleting ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-ink">Radera ligan</p>
              <p className="text-sm text-muted">
                Ligan försvinner för alla medlemmar. Går inte att ångra.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDeleting(true)}>
              Radera ligan
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-medium text-pink">Radera {leagueName} permanent?</p>
            <p className="text-sm text-muted">
              {others.length > 0
                ? `${others.length} ${
                    others.length === 1 ? "annan medlem" : "andra medlemmar"
                  } förlorar ligan. Vill du hellre lämna över den?`
                : "Ingen annan är med i ligan."}
            </p>
            <label className="block text-sm text-muted">
              Skriv{" "}
              <span className="font-mono font-semibold text-ink">{leagueName}</span> för
              att bekräfta:
              <input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                autoComplete="off"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-ink focus:border-pink/60 focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={removeLeague}
                disabled={busy || confirmName.trim() !== leagueName}
                className="inline-flex h-8 items-center rounded-full bg-pink px-4 text-sm font-semibold text-[#1a0410] transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {busy ? "Raderar…" : "Ja, radera ligan"}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeleting(false);
                  setConfirmName("");
                  setError(null);
                }}
              >
                Avbryt
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-pink">{error}</p>}
    </div>
  );
}
