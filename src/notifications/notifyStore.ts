// src/notifications/notifyStore.ts
//
// Opt-in for the daily "sequence of the day" notification. Persistence only,
// no scheduling side effects (those live in scheduler.ts). Same module-store
// shape as musicSettings.ts / vizColorStore.ts.

import { Platform } from "react-native";

export interface NotifySettings {
  enabled: boolean;
}

export const DEFAULT_NOTIFY: NotifySettings = { enabled: false };

const PREFS_KEY = "notify-settings";
const PREFS_FILE = "notify-settings.json";

const state: { current: NotifySettings } = { current: { ...DEFAULT_NOTIFY } };
let version = 0;
const listeners = new Set<() => void>();

function sanitize(raw: any): NotifySettings {
  return { enabled: raw?.enabled === true };
}

export function notifySettings(): NotifySettings {
  return state.current;
}

export function subscribeNotify(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyVersion(): number {
  return version;
}

export function setNotifyEnabled(on: boolean): void {
  state.current = { enabled: on };
  version++;
  listeners.forEach((l) => l());
  void persist();
}

export async function loadNotifySettings(): Promise<void> {
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
