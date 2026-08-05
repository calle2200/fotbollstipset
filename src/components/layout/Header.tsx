"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { NavIcon } from "./NavIcon";
import { primaryNav, allNav } from "@/lib/nav";
import { activeTournament } from "@/lib/mock/data";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Utloggningsknapp — postar till route handlern som rensar sessionen. */
function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/auth/sign-out" method="post" className={className}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-pink"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Logga ut
      </button>
    </form>
  );
}

export function Header({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initial = userEmail ? userEmail[0]!.toUpperCase() : null;

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

          {/* Användarmeny (inloggad) eller inloggningslänk */}
          {userEmail ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                  userMenuOpen || isActive(pathname, "/profil")
                    ? "border-brand/60 bg-brand/10 text-brand"
                    : "border-border bg-surface-2 text-ink hover:border-brand/40",
                )}
                aria-label="Kontomeny"
                aria-expanded={userMenuOpen}
              >
                {initial}
              </button>

              {userMenuOpen && (
                <>
                  {/* Klick utanför stänger menyn */}
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setUserMenuOpen(false)}
                    aria-label="Stäng meny"
                    tabIndex={-1}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                    <div className="border-b border-border px-3 py-2.5">
                      <p className="text-xs text-faint">Inloggad som</p>
                      <p className="truncate text-sm font-medium text-ink">{userEmail}</p>
                    </div>
                    <Link
                      href="/profil"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 21a9 9 0 0 1 18 0" />
                      </svg>
                      Profil
                    </Link>
                    <SignOutButton />
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/#logga-in"
              className="rounded-full border border-border px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-brand/50 hover:text-brand"
            >
              Logga in
            </Link>
          )}

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

          {/* Konto längst ner i mobilmenyn */}
          <div className="mx-auto max-w-6xl border-t border-border px-4 py-3">
            {userEmail ? (
              <>
                <p className="px-3 pb-1 text-xs text-faint">Inloggad som</p>
                <p className="truncate px-3 pb-2 text-sm font-medium text-ink">{userEmail}</p>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/#logga-in"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand"
              >
                Logga in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
