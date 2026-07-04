/**
 * MOCKDATA — endast för att kunna klicka runt i UI:t.
 *
 * TODO (nästa session): allt här ersätts av riktig data från Supabase /
 * football-data.org. Ingen av dessa värden är kopplade till databas, auth
 * eller poänglogik ännu.
 */

export type Team = {
  id: string;
  name: string;
  code: string; // 3-bokstavskod
  flag: string; // emoji som platshållare för flag_url
  group: string;
};

export type MatchStatus = "scheduled" | "live" | "finished";

export type Match = {
  id: string;
  stage: "group" | "r16" | "qf" | "sf" | "final";
  group?: string;
  home: Team;
  away: Team;
  kickoff: string; // ISO
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  /** Användarens (mockade) tips på matchen */
  pick?: { home: number; away: number };
};

export type League = {
  id: string;
  name: string;
  inviteCode: string;
  members: number;
  isPublic: boolean;
  myRank: number;
  owner: string;
};

export type LeaderRow = {
  rank: number;
  username: string;
  points: number;
  isMe?: boolean;
  delta?: number; // förändring i placering
};

export type SpecialPick = {
  id: string;
  label: string;
  choice: string;
  maxPoints: number;
  locked: boolean;
};

// --- Lag & grupper ------------------------------------------------------

export const teams: Team[] = [
  { id: "swe", name: "Sverige", code: "SWE", flag: "🇸🇪", group: "A" },
  { id: "esp", name: "Spanien", code: "ESP", flag: "🇪🇸", group: "A" },
  { id: "cro", name: "Kroatien", code: "CRO", flag: "🇭🇷", group: "A" },
  { id: "jpn", name: "Japan", code: "JPN", flag: "🇯🇵", group: "A" },
  { id: "bra", name: "Brasilien", code: "BRA", flag: "🇧🇷", group: "B" },
  { id: "fra", name: "Frankrike", code: "FRA", flag: "🇫🇷", group: "B" },
  { id: "arg", name: "Argentina", code: "ARG", flag: "🇦🇷", group: "B" },
  { id: "eng", name: "England", code: "ENG", flag: "🏴", group: "B" },
];

const t = (id: string) => teams.find((x) => x.id === id)!;

// --- Matcher ------------------------------------------------------------

export const matches: Match[] = [
  {
    id: "m1",
    stage: "group",
    group: "A",
    home: t("swe"),
    away: t("jpn"),
    kickoff: "2026-06-11T18:00:00Z",
    status: "finished",
    homeScore: 2,
    awayScore: 1,
    pick: { home: 2, away: 0 },
  },
  {
    id: "m2",
    stage: "group",
    group: "A",
    home: t("esp"),
    away: t("cro"),
    kickoff: "2026-06-11T21:00:00Z",
    status: "finished",
    homeScore: 3,
    awayScore: 1,
    pick: { home: 3, away: 1 },
  },
  {
    id: "m3",
    stage: "group",
    group: "B",
    home: t("bra"),
    away: t("eng"),
    kickoff: "2026-06-12T18:00:00Z",
    status: "live",
    homeScore: 1,
    awayScore: 1,
    pick: { home: 2, away: 1 },
  },
  {
    id: "m4",
    stage: "group",
    group: "B",
    home: t("fra"),
    away: t("arg"),
    kickoff: "2026-06-12T21:00:00Z",
    status: "scheduled",
    pick: { home: 1, away: 1 },
  },
  {
    id: "m5",
    stage: "group",
    group: "A",
    home: t("swe"),
    away: t("esp"),
    kickoff: "2026-06-15T18:00:00Z",
    status: "scheduled",
  },
  {
    id: "m6",
    stage: "group",
    group: "B",
    home: t("arg"),
    away: t("eng"),
    kickoff: "2026-06-15T21:00:00Z",
    status: "scheduled",
  },
];

// --- Slutspel (fas 2) ---------------------------------------------------

export const knockoutRounds = [
  {
    id: "r16",
    name: "Åttondelsfinaler",
    status: "open" as const, // open | locked | upcoming
    matches: [
      { id: "k1", home: t("swe"), away: t("arg"), kickoff: "2026-07-04T18:00:00Z" },
      { id: "k2", home: t("esp"), away: t("eng"), kickoff: "2026-07-04T21:00:00Z" },
    ],
  },
  {
    id: "qf",
    name: "Kvartsfinaler",
    status: "upcoming" as const,
    matches: [],
  },
  {
    id: "sf",
    name: "Semifinaler",
    status: "upcoming" as const,
    matches: [],
  },
  {
    id: "final",
    name: "Final",
    status: "upcoming" as const,
    matches: [],
  },
];

// --- Ligor --------------------------------------------------------------

export const leagues: League[] = [
  { id: "l1", name: "Kontoret 2026", inviteCode: "PICK-KX92", members: 14, isPublic: false, myRank: 3, owner: "Du" },
  { id: "l2", name: "Familjen", inviteCode: "PICK-FAM7", members: 6, isPublic: false, myRank: 1, owner: "Mamma" },
  { id: "l3", name: "Öppna VM-ligan", inviteCode: "PICK-OPEN", members: 2381, isPublic: true, myRank: 402, owner: "Pick'em" },
];

// --- Leaderboards -------------------------------------------------------

export const globalLeaderboard: LeaderRow[] = [
  { rank: 1, username: "goalmachine", points: 1240, delta: 0 },
  { rank: 2, username: "tikitaka", points: 1198, delta: 2 },
  { rank: 3, username: "elsa_10", points: 1176, delta: -1 },
  { rank: 4, username: "var_check", points: 1155, delta: 1 },
  { rank: 5, username: "offside_ove", points: 1132, delta: -1 },
  { rank: 6, username: "du_sjalv", points: 1120, delta: 3, isMe: true },
  { rank: 7, username: "hattrick_h", points: 1099, delta: 0 },
  { rank: 8, username: "keeper99", points: 1077, delta: -2 },
  { rank: 9, username: "midfield_maestro", points: 1054, delta: 1 },
  { rank: 10, username: "corner_kalle", points: 1031, delta: 0 },
];

export const leagueLeaderboard: LeaderRow[] = [
  { rank: 1, username: "chef_charlie", points: 640, delta: 0 },
  { rank: 2, username: "petra_p", points: 612, delta: 1 },
  { rank: 3, username: "du_sjalv", points: 598, delta: 2, isMe: true },
  { rank: 4, username: "mattias", points: 571, delta: -2 },
  { rank: 5, username: "sara_k", points: 540, delta: 0 },
];

// --- Specialval ---------------------------------------------------------

export const specialPicks: SpecialPick[] = [
  { id: "winner", label: "Turneringsvinnare", choice: "Brasilien 🇧🇷", maxPoints: 100, locked: true },
  { id: "golden_boot", label: "Skyttekung", choice: "K. Mbappé", maxPoints: 80, locked: true },
  { id: "assists", label: "Flest assist", choice: "P. Foden", maxPoints: 70, locked: true },
  { id: "keeper", label: "Turneringens målvakt", choice: "Unai Simón", maxPoints: 60, locked: true },
  { id: "top_four", label: "Topp fyra", choice: "BRA, FRA, ESP, ENG", maxPoints: 240, locked: true },
  { id: "most_goals_team", label: "Land med flest mål", choice: "Frankrike 🇫🇷", maxPoints: 50, locked: true },
  { id: "first_goal_team", label: "Första målet i turneringen", choice: "Sverige 🇸🇪", maxPoints: 20, locked: true },
];

// --- Inloggad användare (mock) -----------------------------------------

export const currentUser = {
  username: "du_sjalv",
  displayName: "Du",
  avatar: "🦁",
  totalPoints: 1120,
  globalRank: 6,
  leaguesCount: 3,
  correctPicks: 42,
  totalPicks: 61,
};
