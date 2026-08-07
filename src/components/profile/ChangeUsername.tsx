"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { validateUsername, USERNAME_MAX } from "@/lib/username";

/** Hur länge man måste vänta mellan byten — måste matcha databasens trigger. */
export const COOLDOWN_DAYS = 30;

function formatDate(d: Date) {
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });
}

export function ChangeUsername({
  current,
  changedAt,
}: {
  current: string;
  /** När namnet senast byttes (ISO), eller null om aldrig. */
  changedAt: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const nextAllowed = changedAt
    ? new Date(new Date(changedAt).getTime() + COOLDOWN_DAYS * 86_400_000)
    : null;
  const locked = nextAllowed ? nextAllowed > new Date() : false;

  const liveCheck = value.trim() && value !== current ? validateUsername(value) : null;
  const liveError = liveCheck && !liveCheck.ok ? liveCheck.error : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const check = validateUsername(value);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    if (check.value === current) {
      setError("Det är redan ditt användarnamn.");
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
        if (dbError.code === "23505") {
          setError("Det användarnamnet är redan taget. Prova ett annat.");
        } else if (dbError.message?.includes("USERNAME_COOLDOWN")) {
          const date = dbError.message.split("USERNAME_COOLDOWN:")[1]?.trim();
          setError(`Du kan byta användarnamn igen tidigast ${date ?? "om en tid"}.`);
        } else {
          console.error("Kunde inte byta användarnamn:", dbError);
          setError("Kunde inte spara just nu. Försök igen.");
        }
        return;
      }

      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">Användarnamn</p>
          <p className="text-sm text-muted">
            @{current}
            {locked && nextAllowed && (
              <span className="text-faint"> · kan bytas {formatDate(nextAllowed)}</span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          disabled={locked}
          title={
            locked && nextAllowed
              ? `Du kan byta igen ${formatDate(nextAllowed)}`
              : undefined
          }
        >
          Byt namn
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="font-medium text-ink">Byt användarnamn</p>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          @
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={USERNAME_MAX}
          autoFocus
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-7 pr-4 text-ink focus:border-brand/50 focus:outline-none"
        />
      </div>

      <p className="text-xs text-faint">
        Du kan byta igen först om {COOLDOWN_DAYS} dagar, så välj med omsorg.
      </p>

      {(error || liveError) && <p className="text-sm text-pink">{error ?? liveError}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving || Boolean(liveError)}>
          {saving ? "Sparar…" : "Spara"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setValue(current);
            setError(null);
          }}
        >
          Avbryt
        </Button>
      </div>
    </form>
  );
}
