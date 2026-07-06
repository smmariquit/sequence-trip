// src/audio/engine.native.ts

import type { NoteSpec } from "./types";
import { toneToWavUri } from "./wav";

type Sound = import("expo-av").Audio.Sound;

let configured = false;
let audioModule: typeof import("expo-av") | null = null;

async function getAudio() {
  if (!audioModule) {
    audioModule = await import("expo-av");
  }
  return audioModule.Audio;
}

async function ensureAudioMode() {
  if (configured) return;
  const Audio = await getAudio();
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
  configured = true;
}

const cache = new Map<string, Sound>();

function cacheKey(note: NoteSpec): string {
  if (note.drum) return `drum:${note.drum}`;
  return `tone:${Math.round(note.frequency)}:${note.wave}`;
}

async function loadSound(note: NoteSpec): Promise<Sound> {
  const key = cacheKey(note);
  const hit = cache.get(key);
  if (hit) return hit;

  const Audio = await getAudio();
  const uri =
    note.drum === "kick"
      ? toneToWavUri(80, 0.12)
      : note.drum === "snare"
        ? toneToWavUri(180, 0.08)
        : note.drum === "hat"
          ? toneToWavUri(9000, 0.04)
          : toneToWavUri(note.frequency, Math.max(0.05, note.duration));

  const { sound } = await Audio.Sound.createAsync({ uri }, { volume: note.gain });
  cache.set(key, sound);
  return sound;
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
      const sound = await loadSound(note);
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(note.gain);
      await sound.playAsync();
    } catch {
      // Ignore playback failures when expo-av is unavailable.
    }
  }
}

export function setAudioSuspended(_suspended: boolean) {
  // expo-av handles focus; no-op for now.
}
