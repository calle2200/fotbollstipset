"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Raderar kontot permanent. Anropar databasfunktionen delete_own_account(),
 * som bara kan radera den inloggade användaren själv.
 */
export function DeleteAccount({ username }: { username: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim() === username;

  async function handleDelete() {
    if (!canDelete) return;
    setError(null);
    setDeleting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: rpcError } = await supabase.rpc("delete_own_account");

      if (rpcError) {
        console.error("Kunde inte radera kontot:", rpcError);
        setError("Kunde inte radera kontot just nu. Försök igen.");
        setDeleting(false);
        return;
      }

      // Kontot är borta — rensa lokal session och lokala tips, gå till startsidan.
      await supabase.auth.signOut();
      try {
        localStorage.removeItem("pickem:predictions:v1");
      } catch {
        /* ignorera */
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Fel vid radering av konto:", e);
      setError("Något gick fel. Försök igen.");
      setDeleting(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">Radera konto</p>
          <p className="text-sm text-muted">
            Tar bort ditt konto och alla dina tips permanent.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Radera konto
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-medium text-pink">Radera kontot permanent?</p>
      <ul className="space-y-1 text-sm text-muted">
        <li>• Alla dina tips, gruppplaceringar och specialval försvinner.</li>
        <li>• Ditt användarnamn blir ledigt för någon annan.</li>
        <li>• Det går inte att ångra.</li>
      </ul>
      <p className="text-sm text-muted">
        Du kan skapa ett nytt konto med samma mejladress senare — men du börjar
        då om från noll.
      </p>

      <label className="block text-sm text-muted">
        Skriv <span className="font-mono font-semibold text-ink">{username}</span> för
        att bekräfta:
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-ink focus:border-pink/60 focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-pink">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className="inline-flex h-8 items-center justify-center rounded-full bg-pink px-4 text-sm font-semibold text-[#1a0410] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {deleting ? "Raderar…" : "Ja, radera mitt konto"}
        </button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
            setError(null);
          }}
        >
          Avbryt
        </Button>
      </div>
    </div>
  );
}
