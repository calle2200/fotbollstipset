"use client";

import { usePredictions } from "@/lib/predictions/store";

/** Visar att tipsen autosparas lokalt + möjlighet att nollställa. */
export function SaveStatus() {
  const { savedAt, reset } = usePredictions();

  const time = savedAt
    ? new Date(savedAt).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {time ? `Sparat ${time}` : "Autosparas lokalt"}
      </span>
      <button
        type="button"
        onClick={() => {
          if (confirm("Nollställa alla dina tips?")) reset();
        }}
        className="text-sm text-faint underline-offset-4 transition-colors hover:text-muted hover:underline"
      >
        Nollställ
      </button>
    </div>
  );
}
