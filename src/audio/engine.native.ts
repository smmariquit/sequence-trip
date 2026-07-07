// src/audio/engine.native.ts

import type { NoteSpec } from "./types";
import { toneToWavUri } from "./wav";

type AudioPlayer = import("expo-audio").AudioPlayer;

let configured = false;
let audioModule: typeof import("expo-audio") | null = null;

async function getAudio() {
  if (!audioModule) {
    audioModule = await import("expo-audio");
  }
  return audioModule;
}

async function ensureAudioMode() {
  if (configured) return;
  const { setAudioModeAsync } = await getAudio();
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionModeAndroid: "duckOthers",
  });
  configured = true;
}

const cache = new Map<string, AudioPlayer>();

function cacheKey(note: NoteSpec): string {
  if (note.drum) return `drum:${note.drum}`;
  return `tone:${Math.round(note.frequency)}:${note.wave}`;
}

async function loadPlayer(note: NoteSpec): Promise<AudioPlayer> {
  const key = cacheKey(note);
  const hit = cache.get(key);
  if (hit) return hit;

  const { createAudioPlayer } = await getAudio();
  const uri =
    note.drum === "kick"
      ? toneToWavUri(80, 0.12)
      : note.drum === "snare"
        ? toneToWavUri(180, 0.08)
        : note.drum === "hat"
          ? toneToWavUri(9000, 0.04)
          : toneToWavUri(note.frequency, Math.max(0.05, note.duration));

  const player = createAudioPlayer({ uri });
  player.volume = note.gain;
  cache.set(key, player);
  return player;
}

export async function playNotes(notes: NoteSpec[]) {
  if (!notes.length) return;
  try {
    await ensureAudioMode();
  } catch {
    return;
  }
  for (const note of notes) {
    try {
      const player = await loadPlayer(note);
      player.seekTo(0);
      player.volume = note.gain;
      player.play();
    } catch {
      // Ignore playback failures when expo-audio is unavailable.
    }
  }
}

export function setAudioSuspended(_suspended: boolean) {
  // expo-audio handles focus; no-op for now.
}
