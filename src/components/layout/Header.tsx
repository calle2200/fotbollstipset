"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { NavIcon } from "./NavIcon";
import { primaryNav, secondaryNav, allNav } from "@/lib/nav";
import { currentUser } from "@/lib/mock/data";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          {/* Desktop primär nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    active ? "bg-surface-2 text-brand" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin-genväg (desktop) */}
          <Link
            href="/admin"
            className={cn(
              "hidden rounded-full px-3 py-2 text-sm font-medium transition-colors lg:inline-flex",
              isActive(pathname, "/admin") ? "text-brand" : "text-muted hover:text-ink",
            )}
          >
            Admin
          </Link>

          {/* Profil-avatar */}
          <Link
            href="/profil"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-lg transition-colors",
              isActive(pathname, "/profil")
                ? "border-brand/60 bg-brand/10"
                : "border-border bg-surface-2 hover:border-brand/40",
            )}
            aria-label="Profil"
          >
            {currentUser.avatar}
          </Link>

          {/* Mobil menyknapp */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-2 text-ink lg:hidden"
            aria-label="Meny"
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobil slide-in-meny */}
      {menuOpen && (
        <div className="border-t border-border bg-bg/95 backdrop-blur-md lg:hidden">
          <nav className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
            {allNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-surface-2 text-brand" : "text-muted hover:text-ink",
                  )}
                >
                  <NavIcon path={item.icon} className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
