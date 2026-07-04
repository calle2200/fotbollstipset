import Link from "next/link";

export function Logo({ href = "/mitt-tips" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-[#08120b] shadow-[0_0_20px_-4px] shadow-brand/60">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7l4.5 3-1.7 5.3H9.2L7.5 10 12 7z" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink">
        Pick<span className="text-brand">'</span>em
      </span>
    </Link>
  );
}
