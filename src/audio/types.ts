// src/audio/types.ts

export type MusicElementId = "melody" | "bass" | "harmony" | "rhythm" | "digits";

export type WaveType = "sine" | "triangle" | "square" | "sawtooth";

export type DrumKind = "kick" | "snare" | "hat";

export interface NoteSpec {
  frequency: number;
  duration: number;
  gain: number;
  wave: WaveType;
  /** Percussion hits ignore frequency/wave. */
  drum?: DrumKind;
}

export interface MusicElementDef {
  id: MusicElementId;
  label: string;
  icon: "musical-notes" | "radio" | "layers-outline" | "pulse" | "keypad-outline";
  description: string;
}

export interface SonifyContext {
  step: number;
  term: string;
  prevTerm?: string;
  speed: number;
}
