"use client";

import { useState } from "react";

/** Visar inbjudningskoden med en kopiera-knapp. */
export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* vissa webbläsare nekar — koden syns ändå på skärmen */
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 font-mono text-sm tracking-widest text-brand">
        {code}
      </code>
      <button
        type="button"
        onClick={copy}
        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {copied ? "✓ Kopierad" : "Kopiera"}
      </button>
    </div>
  );
}
