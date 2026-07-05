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
import { matches, teams } from "@/lib/mock/data";

export type Score = { home: number; away: number };

type State = {
  scores: Record<string, Score>; // matchId -> resultat
  orders: Record<string, string[]>; // grupp -> teamId[] i placeringsordning
  specials: Record<string, string>; // specialId (ev. "top_four:0") -> valt id
};

type Ctx = State & {
  setScore: (matchId: string, side: "home" | "away", value: number) => void;
  moveTeam: (group: string, index: number, dir: -1 | 1) => void;
  setSpecial: (key: string, value: string) => void;
  reset: () => void;
  savedAt: number | null;
};

const STORAGE_KEY = "pickem:predictions:v1";
const MAX_GOALS = 20;

function seedScores(): Record<string, Score> {
  const s: Record<string, Score> = {};
  for (const m of matches) {
    if (m.pick) s[m.id] = { home: m.pick.home, away: m.pick.away };
  }
  return s;
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

export function PredictionsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(seedState);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const loaded = useRef(false);

  // Läs in sparade tips en gång (klientsidan) och slå ihop med seed-defaults.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState((prev) => ({
          scores: { ...prev.scores, ...parsed.scores },
          orders: { ...prev.orders, ...parsed.orders },
          specials: { ...prev.specials, ...parsed.specials },
        }));
        if (parsed.scores || parsed.specials) setSavedAt(Date.now());
      }
    } catch {
      /* ignorera trasig/otillgänglig storage */
    }
    loaded.current = true;
  }, []);

  // Spegla ändringar till localStorage (efter första inläsningen).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSavedAt(Date.now());
    } catch {
      /* ignorera */
    }
  }, [state]);

  const setScore = useCallback((matchId: string, side: "home" | "away", value: number) => {
    const v = Math.max(0, Math.min(MAX_GOALS, Math.round(value) || 0));
    setState((prev) => {
      const cur = prev.scores[matchId] ?? { home: 0, away: 0 };
      return { ...prev, scores: { ...prev.scores, [matchId]: { ...cur, [side]: v } } };
    });
  }, []);

  const moveTeam = useCallback((group: string, index: number, dir: -1 | 1) => {
    setState((prev) => {
      const list = [...(prev.orders[group] ?? [])];
      const target = index + dir;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, orders: { ...prev.orders, [group]: list } };
    });
  }, []);

  const setSpecial = useCallback((key: string, value: string) => {
    setState((prev) => ({ ...prev, specials: { ...prev.specials, [key]: value } }));
  }, []);

  const reset = useCallback(() => {
    setState(seedState());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignorera */
    }
  }, []);

  return (
    <PredictionsContext.Provider
      value={{ ...state, setScore, moveTeam, setSpecial, reset, savedAt }}
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
