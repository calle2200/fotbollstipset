"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { validateUsername, USERNAME_MAX } from "@/lib/username";

export function UsernameForm({ suggestion }: { suggestion: string }) {
  const router = useRouter();
  const [value, setValue] = useState(suggestion);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Direkt återkoppling medan man skriver (men visa inte fel på tomt fält).
  const liveCheck = value.trim() ? validateUsername(value) : null;
  const liveError = liveCheck && !liveCheck.ok ? liveCheck.error : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const check = validateUsername(value);
    if (!check.ok) {
      setError(check.error);
      return;
    }

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setError("Du verkar inte vara inloggad längre. Ladda om sidan.");
        return;
      }

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ username: check.value, display_name: check.value })
        .eq("id", userId);

      if (dbError) {
        // 23505 = unikhetskrock (namnet är taget)
        if (dbError.code === "23505") {
          setError("Det användarnamnet är redan taget. Prova ett annat.");
        } else {
          console.error("Kunde inte spara användarnamn:", dbError);
          setError("Kunde inte spara just nu. Försök igen.");
        }
        return;
      }

      router.push("/turneringar");
      router.refresh();
    } catch (e) {
      console.error("Fel vid sparande av användarnamn:", e);
      setError("Något gick fel. Försök igen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="username" className="text-sm font-medium text-muted">
        Användarnamn
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          @
        </span>
        <input
          id="username"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={USERNAME_MAX}
          autoFocus
          autoComplete="off"
          placeholder="ditt_namn"
          className="h-12 w-full rounded-xl border border-border bg-surface-2 pl-8 pr-4 text-ink placeholder:text-faint focus:border-brand/50 focus:outline-none"
        />
      </div>

      <p className="text-xs text-faint">
        3–{USERNAME_MAX} tecken. Bokstäver, siffror och understreck. Syns för
        andra i ligor och på topplistan.
      </p>

      {(error || liveError) && (
        <p className="text-sm text-pink">{error ?? liveError}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="neon-glow mt-1 w-full"
        disabled={saving || Boolean(liveError) || !value.trim()}
      >
        {saving ? "Sparar…" : "Kör igång"}
      </Button>
    </form>
  );
}
