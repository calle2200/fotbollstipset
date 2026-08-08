"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/** Översätter databasens felkoder till begriplig svenska. */
function friendlyError(message: string): string {
  if (message.includes("NOT_LOGGED_IN")) return "Du måste vara inloggad.";
  if (message.includes("LEAGUE_NAME_SHORT")) return "Liganamnet måste vara minst 2 tecken.";
  if (message.includes("LEAGUE_NAME_LONG")) return "Liganamnet får vara högst 40 tecken.";
  if (message.includes("LEAGUE_NOT_FOUND")) return "Ingen liga med den koden. Kontrollera stavningen.";
  if (message.includes("NO_TOURNAMENT")) return "Ingen turnering är öppen just nu.";
  return "Något gick fel. Försök igen.";
}

export function CreateLeagueForm({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: rpcError } = await supabase.rpc("create_league", {
        p_name: name.trim(),
      });

      if (rpcError) {
        setError(friendlyError(rpcError.message ?? ""));
        return;
      }

      setName("");
      const created = Array.isArray(data) ? data[0] : data;
      if (created?.id) router.push(`/ligor/${created.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-semibold text-ink">Skapa liga</h3>
      <p className="mt-1 text-sm text-muted">
        Du blir ägare och får en inbjudningskod att dela.
      </p>
      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled || busy}
          maxLength={40}
          placeholder="Liganamn"
          className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3.5 text-ink placeholder:text-faint focus:border-brand/50 focus:outline-none disabled:opacity-50"
        />
        <Button type="submit" disabled={disabled || busy || !name.trim()}>
          {busy ? "Skapar…" : "Skapa"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-pink">{error}</p>}
    </form>
  );
}

type JoinResult = { id: string; name: string; already_member: boolean };

export function JoinLeagueForm({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<{ name: string; id: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!code.trim()) return;

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: rpcError } = await supabase.rpc("join_league", {
        p_code: code.trim(),
      });

      if (rpcError) {
        setError(friendlyError(rpcError.message ?? ""));
        return;
      }

      const joined = data as JoinResult | null;
      if (!joined?.id) {
        setError("Något gick fel. Försök igen.");
        return;
      }

      setCode("");

      if (joined.already_member) {
        // Säg till istället för att tyst flytta användaren.
        setInfo({ name: joined.name, id: joined.id });
        router.refresh();
        return;
      }

      router.push(`/ligor/${joined.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-semibold text-ink">Gå med i liga</h3>
      <p className="mt-1 text-sm text-muted">Ange en inbjudningskod från en vän.</p>
      <div className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={disabled || busy}
          maxLength={10}
          placeholder="ABC123"
          className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3.5 font-mono uppercase tracking-wider text-ink placeholder:text-faint focus:border-brand/50 focus:outline-none disabled:opacity-50"
        />
        <Button type="submit" variant="secondary" disabled={disabled || busy || !code.trim()}>
          {busy ? "Ansluter…" : "Gå med"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-pink">{error}</p>}
      {info && (
        <p className="mt-2 text-sm text-muted">
          Du är redan med i{" "}
          <Link href={`/ligor/${info.id}`} className="font-medium text-brand hover:underline">
            {info.name}
          </Link>
          .
        </p>
      )}
    </form>
  );
}
