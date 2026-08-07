"use client";

import { usePredictions } from "@/lib/predictions/store";

/** Visar att tipsen autosparas lokalt + möjlighet att nollställa. */
export function SaveStatus() {
  const { savedAt, reset, syncsToDatabase, saveError } = usePredictions();

  if (saveError) {
    return (
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-pink/15 px-3 py-1.5 text-sm font-medium text-pink"
          title={saveError}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
          </svg>
          Kunde inte spara
        </span>
        <span className="max-w-xs truncate text-xs text-faint" title={saveError}>
          {saveError}
        </span>
      </div>
    );
  }

  const time = savedAt
    ? new Date(savedAt).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
    : null;

  const label = time
    ? `Sparat ${time}`
    : syncsToDatabase
      ? "Sparas till ditt konto"
      : "Autosparas lokalt";

  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand"
        title={
          syncsToDatabase
            ? "Matchtipsen sparas på ditt konto och följer med mellan enheter."
            : "Tipsen sparas bara i den här webbläsaren. Logga in för att spara dem på ditt konto."
        }
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {label}
        {syncsToDatabase && <span className="text-xs font-normal opacity-70">· ditt konto</span>}
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
