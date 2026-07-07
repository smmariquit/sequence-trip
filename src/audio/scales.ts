// src/audio/scales.ts

import { musicSettings, SCALES } from "./musicSettings";

const A4 = 440;

export function midiToHz(midi: number): number {
  return A4 * Math.pow(2, (midi - 69) / 12);
}

function indexToMidi(index: number, baseMidi: number): number {
  const { scaleId, rootShift } = musicSettings();
  const degrees = SCALES[scaleId];
  const i = ((index % 25) + 25) % 25;
  const octave = Math.floor(i / degrees.length);
  const degree = degrees[i % degrees.length];
  return baseMidi + rootShift + octave * 12 + degree;
}

/** Map a non-negative index into a pentatonic frequency (baseMidi ≈ C4). */
export function indexToFreq(index: number, baseMidi = 60): number {
  return midiToHz(indexToMidi(index, baseMidi));
}

const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

/** Note name (e.g. "E4") for the same mapping as indexToFreq. */
export function indexToNoteName(index: number, baseMidi = 60): string {
  const midi = indexToMidi(index, baseMidi);
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}
