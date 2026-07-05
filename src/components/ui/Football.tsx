/** Små fotbollsrelaterade ikoner + plan-dekor. stroke = currentColor. */

type IconProps = { className?: string };

export function BallIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5l4.2 3-1.6 5H9.4l-1.6-5 4.2-3z" fill="currentColor" stroke="none" />
      <path d="M12 2.5v4M12 17.5v4M3 9l3.8 1M17.2 10L21 9M6.8 19l1.6-3.4M15.6 15.6L17.2 19" />
    </svg>
  );
}

export function WhistleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11a5 5 0 0 1 5-5h13l-2.5 3H12" />
      <circle cx="8" cy="13" r="5" />
      <path d="M8 13h.01M15 3l1 2" />
    </svg>
  );
}

export function BootIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h4l1 6 9 2a3 3 0 0 1 3 3v2H5a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2z" />
      <path d="M6 20v-2M10 20v-2M14 20v-2M18 20v-2" />
    </svg>
  );
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </svg>
  );
}

export function CardsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" strokeLinejoin="round">
      <rect x="4" y="3" width="9" height="14" rx="1.5" transform="rotate(-10 8.5 10)" className="fill-gold" />
      <rect x="11" y="6" width="9" height="14" rx="1.5" transform="rotate(8 15.5 13)" className="fill-pink" />
    </svg>
  );
}

/** Halva planens krit-markeringar (mittcirkel + linjer) som diskret dekor. */
export function PitchMarkings({ className }: IconProps) {
  return (
    <svg viewBox="0 0 400 120" className={className} fill="none" stroke="currentColor" strokeWidth={1.2} preserveAspectRatio="xMidYMid meet">
      <line x1="200" y1="0" x2="200" y2="120" />
      <circle cx="200" cy="60" r="34" />
      <circle cx="200" cy="60" r="2.5" fill="currentColor" stroke="none" />
      <path d="M0 18 H70 V102 H0" />
      <path d="M0 42 H28 V78 H0" />
      <path d="M400 18 H330 V102 H400" />
      <path d="M400 42 H372 V78 H400" />
    </svg>
  );
}
