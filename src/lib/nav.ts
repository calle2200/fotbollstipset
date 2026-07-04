/**
 * En källa för navigeringen — används av både desktop-headern och
 * mobilens bottom-tab-bar samt slide-in-menyn.
 */

export type NavItem = {
  href: string;
  label: string;
  /** Kortare etikett för mobilens tab-bar */
  short: string;
  /** Enkel inline-SVG-ikon (stroke använder currentColor) */
  icon: string;
};

// Primära vyer — visas i mobilens bottom-tab-bar.
export const primaryNav: NavItem[] = [
  {
    href: "/mitt-tips",
    label: "Mitt tips",
    short: "Tips",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    href: "/slutspel",
    label: "Slutspel",
    short: "Slutspel",
    icon: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  },
  {
    href: "/matcher",
    label: "Matcher",
    short: "Matcher",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 7l4.5 3-1.7 5.3H9.2L7.5 10 12 7z",
  },
  {
    href: "/ligor",
    label: "Ligor",
    short: "Ligor",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    short: "Topplista",
    icon: "M4 20V10M12 20V4M20 20v-6",
  },
];

// Sekundära vyer — nås via header/meny, inte i bottom-baren.
export const secondaryNav: NavItem[] = [
  {
    href: "/profil",
    label: "Profil",
    short: "Profil",
    icon: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 21a9 9 0 0 1 18 0",
  },
  {
    href: "/admin",
    label: "Admin",
    short: "Admin",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 14H3.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5 8.6l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 10 5.6V3.5a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 5c.36.36.87.5 1.36.4",
  },
];

export const allNav: NavItem[] = [...primaryNav, ...secondaryNav];
