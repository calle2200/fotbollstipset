"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Status = "idle" | "sending" | "sent" | "error";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(
          error.message.toLowerCase().includes("rate")
            ? "För många försök. Vänta en stund och prova igen."
            : "Något gick fel. Kontrollera adressen och försök igen.",
        );
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
      setMessage("Kunde inte nå inloggningstjänsten. Försök igen.");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-brand/40 bg-brand/10 p-5 text-center">
        <span className="text-2xl">📬</span>
        <p className="font-semibold text-ink">Kolla din mejl!</p>
        <p className="text-sm text-muted">
          Vi skickade en inloggningslänk till{" "}
          <span className="text-ink">{email}</span>. Klicka på länken så är du inne.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
          className="mt-1 text-xs text-faint underline-offset-4 hover:text-muted hover:underline"
        >
          Använd en annan adress
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-sm"
    >
      <label htmlFor="email" className="text-left text-sm font-medium text-muted">
        E-post (magic link)
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="du@example.com"
        className="h-11 rounded-xl border border-border bg-surface-2 px-4 text-ink placeholder:text-faint focus:border-brand/50 focus:outline-none"
      />
      <Button type="submit" size="lg" className="neon-glow w-full" disabled={status === "sending"}>
        {status === "sending" ? "Skickar…" : "Skicka inloggningslänk"}
      </Button>

      {status === "error" && <p className="text-sm text-pink">{message}</p>}

      <p className="text-xs text-faint">
        Du får en länk på mejlen — inget lösenord behövs.
      </p>
    </form>
  );
}
