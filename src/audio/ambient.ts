// src/audio/ambient.ts
//
// Looping zen ambience for app entry on native. Web: no-op (browsers block
// autoplay and the aura is a mobile thing anyway).
//
// Audio: "Heavenly Loop" by isaiah658 — CC0 (public domain), opengameart.org.
// OGG loops gaplessly on Android; MP3 fallback for iOS (no Vorbis support).

import { Platform } from "react-native";

export interface AmbientPrefs {
  enabled: boolean;
  /** 0..1 */
  volume: number;
}

export const DEFAULT_AMBIENT: AmbientPrefs = { enabled: true, volume: 0.35 };

const PREFS_FILE = "ambient-prefs.json";

type AudioPlayer = import("expo-audio").AudioPlayer;
// single memoized init: null again on failure so the next enable retries
let playerP: Promise<AudioPlayer | null> | null = null;

function source() {
  return Platform.OS === "ios"
    ? require("../../assets/audio/zen-loop.mp3")
    : require("../../assets/audio/zen-loop.ogg");
}

function ensurePlayer(volume: number): Promise<AudioPlayer | null> {
  if (!playerP) {
    playerP = (async () => {
      const { createAudioPlayer, setAudioModeAsync } = await import("expo-audio");
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionModeAndroid: "duckOthers",
      });
      const p = createAudioPlayer(source());
      p.loop = true;
      p.volume = volume;
      p.play();
      return p;
    })().catch(() => {
      // ponytail: audio unavailable → silent app, not a crash
      playerP = null;
      return null;
    });
  }
  return playerP;
}

export async function applyAmbient(prefs: AmbientPrefs): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    if (!prefs.enabled) {
      // don't lazily create a player just to pause it
      if (playerP) (await playerP)?.pause();
      return;
    }
    const player = await ensurePlayer(prefs.volume);
    if (player) {
      player.volume = prefs.volume;
      player.play();
    }
  } catch {
    // ignore — never let ambience break the app
  }
}

export async function loadAmbientPrefs(): Promise<AmbientPrefs> {
  if (Platform.OS === "web") return { ...DEFAULT_AMBIENT, enabled: false };
  try {
    const { File, Paths } = await import("expo-file-system");
    const f = new File(Paths.document, PREFS_FILE);
    if (!f.exists) return DEFAULT_AMBIENT;
    const raw = JSON.parse(await f.text());
    return {
      enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_AMBIENT.enabled,
      volume:
        typeof raw.volume === "number" && raw.volume >= 0 && raw.volume <= 1
          ? raw.volume
          : DEFAULT_AMBIENT.volume,
    };
  } catch {
    return DEFAULT_AMBIENT;
  }
}

export async function saveAmbientPrefs(prefs: AmbientPrefs): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const { File, Paths } = await import("expo-file-system");
    new File(Paths.document, PREFS_FILE).write(JSON.stringify(prefs));
  } catch {
    // best effort
  }
}
