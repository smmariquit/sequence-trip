// src/audio/elements.ts

import type { MusicElementDef, MusicElementId } from "./types";

export const MUSIC_ELEMENTS: MusicElementDef[] = [
  {
    id: "melody",
    label: "Melody",
    icon: "musical-notes",
    description:
      "The remainder of a(n) divided by 25 picks a step on the chosen scale: bigger remainder, higher note. Played as a pure tone.",
  },
  {
    id: "bass",
    label: "Bass",
    icon: "radio",
    description:
      "The remainder of a(n) divided by 15 picks a low note about one and a half octaves down, in a warmer tone that carries the melody.",
  },
  {
    id: "harmony",
    label: "Harmony",
    icon: "layers-outline",
    description:
      "The remainder of a(n) divided by 5, nudged by where you are in the sequence, picks a soft high note that shades the melody.",
  },
  {
    id: "rhythm",
    label: "Rhythm",
    icon: "pulse",
    description:
      "Drums from the numbers: kick on every 4th term, snare whenever a(n) is odd, hi-hat on every 3rd term.",
  },
  {
    id: "digits",
    label: "Digits",
    icon: "keypad-outline",
    description:
      "Plays the last four decimal digits of a(n) as a quick run of notes: each digit is a note, 0 low up to 9 high.",
  },
  {
    id: "pad",
    label: "Pad",
    icon: "cloudy-outline",
    description:
      "Every 4th term, the remainder of a(n) divided by 10 roots a sustained three-note chord that hums under everything.",
  },
];

export const DEFAULT_ELEMENTS: MusicElementId[] = ["melody", "pad"];

export function isMusicElementId(id: string): id is MusicElementId {
  return MUSIC_ELEMENTS.some((el) => el.id === id);
}
