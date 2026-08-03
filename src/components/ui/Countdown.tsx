"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Parts = { total: number; days: number; hours: number; minutes: number; seconds: number };

function diff(target: number): Parts {
  const total = Math.max(0, target - Date.now());
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total % 86_400_000) / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Nedräkning till en tidpunkt.
 * variant "banner" — kompakt en-radare (topp på sidorna)
 * variant "cards"  — större rutor för dagar/tim/min/sek (turneringskortet)
 */
export function Countdown({
  target,
  variant = "banner",
  label = "Avspark om",
  className,
}: {
  target: string;
  variant?: "banner" | "cards";
  label?: string;
  className?: string;
}) {
  const t = new Date(target).getTime();
  const [time, setTime] = useState<Parts | null>(null);

  useEffect(() => {
    setTime(diff(t));
    const id = setInterval(() => setTime(diff(t)), 1000);
    return () => clearInterval(id);
  }, [t]);

  const started = time !== null && time.total <= 0;

  if (variant === "cards") {
    const boxes = [
      { v: time?.days, l: "Dagar" },
      { v: time?.hours, l: "Tim" },
      { v: time?.minutes, l: "Min" },
      { v: time?.seconds, l: "Sek" },
    ];
    if (started) {
      return (
        <div className={cn("rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-center text-sm font-semibold text-brand", className)}>
          🎉 Turneringen har börjat!
        </div>
      );
    }
    return (
      <div className={cn("grid grid-cols-4 gap-2", className)}>
        {boxes.map((b) => (
          <div key={b.l} className="rounded-xl border border-border bg-surface-2/70 py-2.5 text-center">
            <div className="text-2xl font-bold tabular-nums text-ink">
              {b.v == null ? "—" : b.l === "Dagar" ? b.v : pad(b.v)}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-faint">{b.l}</div>
          </div>
        ))}
      </div>
    );
  }

  // variant "banner"
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2M9 2h6" />
      </svg>
      {started ? (
        <span className="font-medium text-brand">Turneringen har börjat!</span>
      ) : (
        <>
          <span>{label}</span>
          <span className="font-semibold tabular-nums text-ink">
            {time == null
              ? "—"
              : `${time.days}d ${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`}
          </span>
        </>
      )}
    </span>
  );
}
