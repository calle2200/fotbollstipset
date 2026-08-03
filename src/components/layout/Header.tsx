"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { NavIcon } from "./NavIcon";
import { primaryNav, secondaryNav, allNav } from "@/lib/nav";
import { currentUser, activeTournament } from "@/lib/mock/data";
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
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <Logo />
            {/* Aktiv turnering — klicka för att byta */}
            <Link
              href="/turneringar"
              title="Byt turnering"
              className="hidden items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-brand/40 hover:text-ink sm:inline-flex"
            >
              {activeTournament.short}
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
              </svg>
            </Link>
          </div>
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
          <div className="mx-auto max-w-6xl px-4 pt-3">
            <Link
              href="/turneringar"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
            >
              <span className="text-muted">
                Turnering: <span className="font-semibold text-ink">{activeTournament.short}</span>
              </span>
              <span className="text-xs font-medium text-brand">Byt →</span>
            </Link>
          </div>
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
