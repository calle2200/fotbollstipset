"use client";

/**
 * Lokal tips-store — håller användarens tips i React-state och speglar dem
 * till localStorage så de överlever omladdning.
 *
 * TODO (nästa session): byt localStorage mot Supabase (läs/skriv per användare,
 * låsning vid deadline, server-side poängberäkning). Formen på datan här är
 * medvetet enkel att mappa till predictions/group_predictions/special_predictions.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { teams, activeTournament } from "@/lib/mock/data";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type Score = { home: number; away: number };

type State = {
  scores: Record<string, Score>; // matchId -> resultat
  orders: Record<string, string[]>; // grupp -> teamId[] i placeringsordning
  specials: Record<string, string>; // specialId (ev. "top_four:0") -> valt id
};

type Ctx = State & {
  setScore: (matchId: string, side: "home" | "away", value: number) => void;
  /**
   * Ändra målet relativt (+1 / -1). Använd denna från knappar — den räknar från
   * senast satta värdet, så snabba klick i rad inte tappas bort.
   */
  bumpScore: (matchId: string, side: "home" | "away", delta: number) => void;
  moveTeam: (group: string, index: number, dir: -1 | 1) => void;
  setSpecial: (key: string, value: string) => void;
  reset: () => void;
  savedAt: number | null;
  /** true när tipsen sparas till databasen (inloggad), false för gäst. */
  syncsToDatabase: boolean;
  /** Satt om senaste skrivningen mot databasen misslyckades. */
  saveError: string | null;
};

const STORAGE_KEY = "pickem:predictions:v1";
const MAX_GOALS = 20;

/**
 * Inga förifyllda matchtips. Matcher utan sparat tips visas som 0–0, så att
 * ett ifyllt värde alltid betyder "det här har användaren faktiskt valt".
 */
function seedScores(): Record<string, Score> {
  return {};
}

function seedOrders(): Record<string, string[]> {
  const o: Record<string, string[]> = {};
  for (const t of teams) (o[t.group] ??= []).push(t.id);
  return o;
}

function seedState(): State {
  return { scores: seedScores(), orders: seedOrders(), specials: {} };
}

const PredictionsContext = createContext<Ctx | null>(null);

/** Vänta så länge efter sista klicket innan vi skriver till databasen. */
const SAVE_DELAY_MS = 700;

export function PredictionsProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  /** Inloggad användares id — null för gäster (då sparas allt lokalt). */
  userId?: string | null;
}) {
  const [state, setState] = useState<State>(seedState);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const loaded = useRef(false);

  // Speglingar av senaste värden, så snabba klick inte tappas bort.
  const scoresRef = useRef(state.scores);
  const ordersRef = useRef(state.orders);
  const specialsRef = useRef(state.specials);
  useEffect(() => {
    scoresRef.current = state.scores;
    ordersRef.current = state.orders;
    specialsRef.current = state.specials;
  }, [state]);

  // Köer för skrivningar till databasen (samlar ihop snabba klick).
  const pendingScores = useRef<Map<string, Score>>(new Map());
  const pendingGroups = useRef<Set<string>>(new Set());
  const pendingSpecials = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (!userId) return;

    const scoreEntries = [...pendingScores.current.entries()];
    const groupKeys = [...pendingGroups.current];
    const specialKeys = [...pendingSpecials.current];
    if (!scoreEntries.length && !groupKeys.length && !specialKeys.length) return;

    pendingScores.current.clear();
    pendingGroups.current.clear();
    pendingSpecials.current.clear();

    /** Lägg tillbaka i kön så inget går förlorat om skrivningen misslyckas. */
    const requeue = () => {
      for (const [id, s] of scoreEntries)
        if (!pendingScores.current.has(id)) pendingScores.current.set(id, s);
      for (const g of groupKeys) pendingGroups.current.add(g);
      for (const k of specialKeys) pendingSpecials.current.add(k);
    };

    try {
      const supabase = createSupabaseBrowserClient();
      const tournamentId = activeTournament.id;

      if (scoreEntries.length) {
        const rows = scoreEntries.map(([match_id, s]) => ({
          user_id: userId,
          match_id,
          pred_home: s.home,
          pred_away: s.away,
        }));
        const { error } = await supabase
          .from("predictions")
          .upsert(rows, { onConflict: "user_id,match_id" });
        if (error) throw error;
      }

      if (groupKeys.length) {
        // En rad per lag med dess position i gruppen.
        const rows = groupKeys.flatMap((group) =>
          (ordersRef.current[group] ?? []).map((teamId, i) => ({
            user_id: userId,
            tournament_id: tournamentId,
            group_label: group,
            team_id: teamId,
            position: i + 1,
          })),
        );
        if (rows.length) {
          const { error } = await supabase
            .from("group_predictions")
            .upsert(rows, { onConflict: "user_id,team_id" });
          if (error) throw error;
        }
      }

      if (specialKeys.length) {
        const rows = specialKeys.map((market) => ({
          user_id: userId,
          tournament_id: tournamentId,
          market,
          option: specialsRef.current[market] || null,
        }));
        const { error } = await supabase
          .from("special_predictions")
          .upsert(rows, { onConflict: "user_id,market" });
        if (error) throw error;
      }

      setSaveError(null);
      setSavedAt(Date.now());
    } catch (e) {
      requeue();
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : String(e);
      console.error("Kunde inte spara tips till databasen:", e);
      setSaveError(msg || "Okänt fel");
    }
  }, [userId]);

  /** Schemalägg en samlad skrivning strax efter sista ändringen. */
  const scheduleFlush = useCallback(() => {
    if (!userId) {
      // Gäst: localStorage-effekten sparar, så markera direkt som sparat.
      setSavedAt(Date.now());
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
  }, [userId, flush]);

  // Läs in sparade tips: från databasen om inloggad, annars från localStorage.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // localStorage först — gäller gruppplaceringar och specialval för alla,
      // och matchtips för gäster.
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<State>;
          if (!cancelled) {
            setState((prev) => ({
              scores: { ...prev.scores, ...parsed.scores },
              orders: { ...prev.orders, ...parsed.orders },
              specials: { ...prev.specials, ...parsed.specials },
            }));
          }
        }
      } catch {
        /* ignorera trasig/otillgänglig storage */
      }

      // Inloggad: databasen är facit för alla tips.
      if (userId) {
        try {
          const supabase = createSupabaseBrowserClient();
          const [scoreRes, groupRes, specialRes] = await Promise.all([
            supabase.from("predictions").select("match_id, pred_home, pred_away"),
            supabase
              .from("group_predictions")
              .select("group_label, team_id, position")
              .order("position", { ascending: true }),
            supabase.from("special_predictions").select("market, option"),
          ]);

          if (!cancelled) {
            const hasData =
              scoreRes.data?.length || groupRes.data?.length || specialRes.data?.length;

            setState((prev) => {
              const scores = { ...prev.scores };
              for (const r of scoreRes.data ?? []) {
                scores[r.match_id as string] = {
                  home: r.pred_home as number,
                  away: r.pred_away as number,
                };
              }

              const orders = { ...prev.orders };
              const byGroup = new Map<string, string[]>();
              for (const r of groupRes.data ?? []) {
                const g = r.group_label as string;
                if (!byGroup.has(g)) byGroup.set(g, []);
                byGroup.get(g)!.push(r.team_id as string);
              }
              for (const [g, list] of byGroup) orders[g] = list;

              const specials = { ...prev.specials };
              for (const r of specialRes.data ?? []) {
                if (r.option) specials[r.market as string] = r.option as string;
              }

              return { scores, orders, specials };
            });

            if (hasData) setSavedAt(Date.now());
          }
        } catch {
          /* faller tillbaka på det som lästes lokalt */
        }
      }

      loaded.current = true;
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Spegla alltid till localStorage (fungerar som cache och som gästlagring).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignorera */
    }
  }, [state]);

  const setScore = useCallback(
    (matchId: string, side: "home" | "away", value: number) => {
      const v = Math.max(0, Math.min(MAX_GOALS, Math.round(value) || 0));
      const cur = scoresRef.current[matchId] ?? { home: 0, away: 0 };
      const next = { ...cur, [side]: v };
      // Håll speglingen färsk direkt, så flera klick i rad räknas rätt.
      scoresRef.current = { ...scoresRef.current, [matchId]: next };
      setState((prev) => ({ ...prev, scores: { ...prev.scores, [matchId]: next } }));
      pendingScores.current.set(matchId, next);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const bumpScore = useCallback(
    (matchId: string, side: "home" | "away", delta: number) => {
      // Läs från speglingen, inte från renderat värde — annars tappas snabba klick.
      const cur = scoresRef.current[matchId] ?? { home: 0, away: 0 };
      setScore(matchId, side, cur[side] + delta);
    },
    [setScore],
  );

  const moveTeam = useCallback(
    (group: string, index: number, dir: -1 | 1) => {
      const list = [...(ordersRef.current[group] ?? [])];
      const target = index + dir;
      if (target < 0 || target >= list.length) return;
      [list[index], list[target]] = [list[target], list[index]];

      ordersRef.current = { ...ordersRef.current, [group]: list };
      setState((prev) => ({ ...prev, orders: { ...prev.orders, [group]: list } }));
      pendingGroups.current.add(group);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const setSpecial = useCallback(
    (key: string, value: string) => {
      specialsRef.current = { ...specialsRef.current, [key]: value };
      setState((prev) => ({ ...prev, specials: { ...prev.specials, [key]: value } }));
      pendingSpecials.current.add(key);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const reset = useCallback(() => {
    // Avbryt ev. kösatt skrivning så den inte återskapar det vi just rensat.
    if (timer.current) clearTimeout(timer.current);
    pendingScores.current.clear();
    pendingGroups.current.clear();
    pendingSpecials.current.clear();

    const fresh = seedState();
    setState(fresh);
    scoresRef.current = fresh.scores;
    ordersRef.current = fresh.orders;
    specialsRef.current = fresh.specials;
    setSaveError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignorera */
    }

    // Inloggad: rensa även i databasen (RLS gör att bara egna rader träffas).
    if (userId) {
      void (async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          await Promise.all([
            supabase.from("predictions").delete().eq("user_id", userId),
            supabase.from("group_predictions").delete().eq("user_id", userId),
            supabase.from("special_predictions").delete().eq("user_id", userId),
          ]);
          setSavedAt(null);
        } catch (e) {
          console.error("Kunde inte nollställa tips i databasen:", e);
        }
      })();
    }
  }, [userId]);

  return (
    <PredictionsContext.Provider
      value={{
        ...state,
        setScore,
        bumpScore,
        moveTeam,
        setSpecial,
        reset,
        savedAt,
        syncsToDatabase: Boolean(userId),
        saveError,
      }}
    >
      {children}
    </PredictionsContext.Provider>
  );
}

export function usePredictions() {
  const ctx = useContext(PredictionsContext);
  if (!ctx) throw new Error("usePredictions måste användas inom PredictionsProvider");
  return ctx;
}
