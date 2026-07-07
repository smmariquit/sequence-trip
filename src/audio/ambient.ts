// src/audio/ambient.ts
//
// Looping zen pad for app entry on native. Web: no-op (browsers block
// autoplay and the aura is a mobile thing anyway).

import { Platform } from "react-native";
import { padToWavUri } from "./wav";

export type AmbientLevel = "on" | "low" | "off";

export const AMBIENT_VOLUME: Record<Exclude<AmbientLevel, "off">, number> = {
  on: 0.3,
  low: 0.1,
};

// A2 root with fifth + octaves: 110/165/220/330 Hz — all integer cycle
// counts over 4s, so the loop is seamless. Calm open-fifth drone.
const PAD_FREQS = [110, 165, 220, 330];
const PAD_LOOP_SEC = 4;

type AudioPlayer = import("expo-audio").AudioPlayer;
let player: AudioPlayer | null = null;
let starting: Promise<void> | null = null;

async function ensureStarted(volume: number): Promise<void> {
  if (Platform.OS === "web") return;
  if (player) return;
  if (!starting) {
    starting = (async () => {
      const { createAudioPlayer, setAudioModeAsync } = await import("expo-audio");
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionModeAndroid: "duckOthers",
      });
      const p = createAudioPlayer({ uri: padToWavUri(PAD_FREQS, PAD_LOOP_SEC) });
      p.loop = true;
      p.volume = volume;
      player = p;
      p.play();
    })().catch(() => {
      // ponytail: audio unavailable → silent app, not a crash
      starting = null;
    });
  }
  return starting;
}

export async function setAmbientLevel(level: AmbientLevel): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    if (level === "off") {
      player?.pause();
      return;
    }
    await ensureStarted(AMBIENT_VOLUME[level]);
    if (player) {
      player.volume = AMBIENT_VOLUME[level];
      player.play();
    }
  } catch {
    // ignore — never let ambience break the app
  }
}
