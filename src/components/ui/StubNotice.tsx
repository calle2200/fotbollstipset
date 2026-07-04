/**
 * Tydlig markör i UI:t för funktioner som stubbas nu och byggs i nästa session
 * (auth, databas, API, poänglogik). Rendered så att man ser vad som saknas.
 */
export function StubNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-brand/40 bg-brand/5 px-4 py-3 text-sm text-muted">
      <svg
        viewBox="0 0 24 24"
        className="mt-0.5 h-4 w-4 shrink-0 text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <p>
        <span className="font-medium text-ink">Platshållare.</span> {children}
      </p>
    </div>
  );
}
