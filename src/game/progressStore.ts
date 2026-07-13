import { Platform } from "react-native";
import {
  GAME_DIFFICULTIES,
  MAX_GUESSES,
  type DailyPlay,
  type GameDifficulty,
} from "./daily";

interface GameProgress {
  plays: Record<string, DailyPlay>;
}

const STORAGE_KEY = "oeisdle-progress-v1";
const STORAGE_FILE = "oeisdle-progress.json";

const state: { current: GameProgress } = { current: { plays: {} } };
let version = 0;
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  version++;
  listeners.forEach((listener) => listener());
}

function sanitize(raw: any): GameProgress {
  const plays: Record<string, DailyPlay> = {};
  if (!raw?.plays || typeof raw.plays !== "object") return { plays };

  for (const [date, value] of Object.entries(raw.plays as Record<string, any>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^A\d{6}$/.test(value?.anum)) continue;
    if (!Object.prototype.hasOwnProperty.call(GAME_DIFFICULTIES, value?.difficulty)) continue;
    const guesses = Array.isArray(value.guesses)
      ? value.guesses.filter((guess: unknown) => typeof guess === "string").slice(0, MAX_GUESSES)
      : [];
    const completed = value.completed === true || guesses.length >= MAX_GUESSES;
    plays[date] = {
      date,
      anum: value.anum,
      difficulty: value.difficulty as GameDifficulty,
      guesses,
      completed,
      won: completed && value.won === true,
    };
  }
  return { plays };
}

export function gameProgress(): GameProgress {
  return state.current;
}

export function gameProgressVersion(): number {
  return version;
}

export function isGameProgressLoaded(): boolean {
  return loaded;
}

export function subscribeGameProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recordDailyPlay(play: DailyPlay): void {
  state.current = {
    plays: {
      ...state.current.plays,
      [play.date]: play,
    },
  };
  emit();
  void persist();
}

export function loadGameProgress(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      let raw: string | null = null;
      if (Platform.OS === "web") {
        raw = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
      } else {
        const { File, Paths } = await import("expo-file-system");
        const file = new File(Paths.document, STORAGE_FILE);
        raw = file.exists ? await file.text() : null;
      }
      if (raw) state.current = sanitize(JSON.parse(raw));
    } catch {
      // A missing or damaged save should not block the daily puzzle.
    } finally {
      loaded = true;
      emit();
    }
  })();
  return loadPromise;
}

async function persist(): Promise<void> {
  try {
    const raw = JSON.stringify(state.current);
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(STORAGE_KEY, raw);
    } else {
      const { File, Paths } = await import("expo-file-system");
      new File(Paths.document, STORAGE_FILE).write(raw);
    }
  } catch {
    // Best effort. The game remains playable without persistence.
  }
}
