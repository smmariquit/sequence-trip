// src/audio/elements.ts

import type { MusicElementDef, MusicElementId } from "./types";

export const MUSIC_ELEMENTS: MusicElementDef[] = [
  {
    id: "melody",
    label: "Melody",
    icon: "musical-notes",
    description: "Term values mapped to a pentatonic melody",
  },
  {
    id: "bass",
    label: "Bass",
    icon: "radio",
    description: "Low undertone from each term",
  },
  {
    id: "harmony",
    label: "Harmony",
    icon: "layers-outline",
    description: "Soft chord tones from term mod 5",
  },
  {
    id: "rhythm",
    label: "Rhythm",
    icon: "pulse",
    description: "Kick, snare, and hi-hat driven by index",
  },
  {
    id: "digits",
    label: "Digits",
    icon: "keypad-outline",
    description: "Arpeggio through the decimal digits of a(n)",
  },
  {
    id: "pad",
    label: "Pad",
    icon: "cloudy-outline",
    description: "Sustained chord bed under the melody",
  },
];

export const DEFAULT_ELEMENTS: MusicElementId[] = ["melody", "pad"];

export function isMusicElementId(id: string): id is MusicElementId {
  return MUSIC_ELEMENTS.some((el) => el.id === id);
}
