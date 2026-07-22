// src/audio/musicSettings.ts
//
// How terms become notes: musical scale and root shift. Module store so
// scales.ts can consult it from the audio path; UI subscribes for re-render.

import { Platform } from "react-native";

export type ScaleId = "pentatonic" | "major" | "minor" | "chromatic";

export const SCALES: Record<ScaleId, number[]> = {
  pentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

export const SCALE_LABELS: Record<ScaleId, string> = {
  pentatonic: "Pentatonic",
  major: "Major",
  minor: "Minor",
  chromatic: "Chromatic",
};

/** Plain-language description of the selected scale, shown in settings. */
export const SCALE_DESCRIPTIONS: Record<ScaleId, string> = {
  pentatonic:
    "Five notes per octave, the black-keys-of-a-piano sound. Any two notes sound good together, so even wild sequences stay pleasant.",
  major:
    "Seven notes per octave, the bright, happy scale most pop songs use.",
  minor:
    "Seven notes per octave, the darker, moodier cousin of major.",
  chromatic:
    "All twelve notes, nothing left out. The most faithful to the raw numbers, and the most tense sounding.",
};

export interface MusicSettings {
  scaleId: ScaleId;
  /** Semitones added to every note, 0-11. Moves the whole piece's key. */
  rootShift: number;
}

export const DEFAULT_MUSIC: MusicSettings = { scaleId: "pentatonic", rootShift: 0 };

const PREFS_KEY = "music-settings";
const PREFS_FILE = "music-settings.json";

// object wrapper: worklet/closure copies keep object refs live, primitives not
const state: { current: MusicSettings } = { current: { ...DEFAULT_MUSIC } };
let version = 0;
const listeners = new Set<() => void>();

function sanitize(raw: any): MusicSettings {
  return {
    scaleId:
      raw && Object.prototype.hasOwnProperty.call(SCALES, raw.scaleId)
        ? raw.scaleId
        : DEFAULT_MUSIC.scaleId,
    rootShift:
      raw && typeof raw.rootShift === "number"
        ? ((Math.round(raw.rootShift) % 12) + 12) % 12
        : DEFAULT_MUSIC.rootShift,
  };
}

export function musicSettings(): MusicSettings {
  return state.current;
}

export function setMusicSettings(next: MusicSettings): void {
  state.current = sanitize(next);
  version++;
  listeners.forEach((l) => l());
  void persist();
}

export function subscribeMusicSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function musicSettingsVersion(): number {
  return version;
}

export async function loadMusicSettings(): Promise<void> {
  try {
    let raw: string | null = null;
    if (Platform.OS === "web") {
      raw = globalThis.localStorage?.getItem(PREFS_KEY) ?? null;
    } else {
      const { File, Paths } = await import("expo-file-system");
      const f = new File(Paths.document, PREFS_FILE);
      raw = f.exists ? await f.text() : null;
    }
    if (raw) {
      state.current = sanitize(JSON.parse(raw));
      version++;
      listeners.forEach((l) => l());
    }
  } catch {
    // defaults are fine
  }
}

async function persist(): Promise<void> {
  try {
    const raw = JSON.stringify(state.current);
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(PREFS_KEY, raw);
    } else {
      const { File, Paths } = await import("expo-file-system");
      new File(Paths.document, PREFS_FILE).write(raw);
    }
  } catch {
    // best effort
  }
}
