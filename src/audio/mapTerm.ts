// src/audio/mapTerm.ts

import { termMod } from "../sequences/normalize";
import { STEP_MS } from "../playback/progressConstants";
import { indexToFreq } from "./scales";
import type { MusicElementId, NoteSpec, SonifyContext } from "./types";

function stepDuration(speed: number): number {
  return (STEP_MS / 1000) * 0.85 / Math.max(speed, 0.25);
}

function melodyNote(ctx: SonifyContext): NoteSpec {
  const idx = termMod(ctx.term, 25);
  return {
    frequency: indexToFreq(idx, 60),
    duration: stepDuration(ctx.speed),
    gain: 0.32,
    wave: "sine",
  };
}

function bassNote(ctx: SonifyContext): NoteSpec {
  const idx = termMod(ctx.term, 15);
  return {
    frequency: indexToFreq(idx, 43),
    duration: stepDuration(ctx.speed) * 1.1,
    gain: 0.22,
    wave: "triangle",
  };
}

function harmonyNote(ctx: SonifyContext): NoteSpec {
  const idx = termMod(ctx.term, 5) + ctx.step % 3;
  return {
    frequency: indexToFreq(idx, 67),
    duration: stepDuration(ctx.speed) * 0.9,
    gain: 0.14,
    wave: "sine",
  };
}

function rhythmNotes(ctx: SonifyContext): NoteSpec[] {
  const notes: NoteSpec[] = [];
  const dur = stepDuration(ctx.speed) * 0.35;

  if (ctx.step % 4 === 0) {
    notes.push({ frequency: 80, duration: dur, gain: 0.45, wave: "sine", drum: "kick" });
  }
  if (termMod(ctx.term, 2) === 1) {
    notes.push({ frequency: 200, duration: dur * 0.7, gain: 0.28, wave: "square", drum: "snare" });
  }
  if (ctx.step % 3 === 0) {
    notes.push({ frequency: 8000, duration: dur * 0.25, gain: 0.12, wave: "square", drum: "hat" });
  }
  return notes;
}

function digitNotes(ctx: SonifyContext): NoteSpec[] {
  const digits = ctx.term.replace(/^-/, "").split("").filter((c) => c >= "0" && c <= "9");
  if (!digits.length) return [];

  const slice = digits.slice(-4);
  const baseDur = stepDuration(ctx.speed) / (slice.length + 1);

  return slice.map((d, i) => ({
    frequency: indexToFreq(Number(d) + i * 2, 72),
    duration: baseDur,
    gain: 0.18,
    wave: "triangle" as const,
  }));
}

function padNotes(ctx: SonifyContext): NoteSpec[] {
  // Sustained pentatonic triad every 4th step — the arrangement bed under
  // the per-term melody (musification layer, not raw parameter mapping).
  if (ctx.step % 4 !== 0) return [];
  const root = termMod(ctx.term, 10);
  const dur = stepDuration(ctx.speed) * 3.5;
  return [0, 2, 4].map((stack, i) => ({
    frequency: indexToFreq(root + stack, 48),
    duration: dur,
    gain: 0.09 - i * 0.02,
    wave: "sine" as const,
  }));
}

const mappers: Record<
  MusicElementId,
  (ctx: SonifyContext) => NoteSpec | NoteSpec[]
> = {
  melody: melodyNote,
  bass: bassNote,
  harmony: harmonyNote,
  rhythm: rhythmNotes,
  digits: digitNotes,
  pad: padNotes,
};

/** Map one construction step into note specs for the active musical elements. */
export function mapStepToNotes(
  ctx: SonifyContext,
  elements: MusicElementId[]
): NoteSpec[] {
  const out: NoteSpec[] = [];
  for (const id of elements) {
    const mapped = mappers[id](ctx);
    if (Array.isArray(mapped)) out.push(...mapped);
    else out.push(mapped);
  }
  return out;
}

/**
 * Variable tempo sampling (arXiv 2508.06872): steep regions play denser.
 * Extra melody notes for one step, pitch-interpolated from a(n-1) to a(n);
 * caller staggers them across the step window.
 */
export function tempoSubNotes(ctx: SonifyContext, count: number): NoteSpec[] {
  if (count <= 0 || !ctx.prevTerm) return [];
  const from = termMod(ctx.prevTerm, 25);
  const to = termMod(ctx.term, 25);
  const dur = stepDuration(ctx.speed) / (count + 1);
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / (count + 1);
    return {
      frequency: indexToFreq(Math.round(from + (to - from) * t), 60),
      duration: dur,
      gain: 0.2,
      wave: "sine" as const,
    };
  });
}
