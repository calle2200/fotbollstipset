import { cn } from "@/lib/cn";

type Tone =
  | "brand"
  | "mint"
  | "cyan"
  | "blue"
  | "violet"
  | "pink"
  | "orange"
  | "gold"
  | "muted"
  | "live";

const tones: Record<Tone, string> = {
  brand: "bg-brand/15 text-brand",
  mint: "bg-mint/15 text-mint",
  cyan: "bg-cyan/15 text-cyan",
  blue: "bg-blue/15 text-blue",
  violet: "bg-violet/15 text-violet",
  pink: "bg-pink/15 text-pink",
  orange: "bg-orange/15 text-orange",
  gold: "bg-gold/15 text-gold",
  muted: "bg-surface-2 text-muted",
  live: "bg-pink/15 text-pink",
};

export function Badge({
  tone = "muted",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Liten pulserande prick för live-status. */
export function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  );
}
