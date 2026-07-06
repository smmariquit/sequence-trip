// src/sequences/termCount.ts

import type { OEISSequence, VizType } from "./types";
import { MAX_BFILE_TERMS } from "../oeis/bfile";

const VIZ_DEFAULT_COUNT: Record<VizType, number> = {
  "recaman-arcs": 64,
  "fibonacci-spiral": 300,
  "ulam-spiral": 2000,
  "collatz-tree": 40,
  "pascal-fractal": 128,
  "digit-flow": 400,
};

const VIZ_MAX_COUNT: Record<VizType, number> = {
  "recaman-arcs": 512,
  "fibonacci-spiral": 1200,
  "ulam-spiral": 2000,
  "collatz-tree": 200,
  "pascal-fractal": 512,
  "digit-flow": 2000,
};

/** How many more terms/steps to add per "Load more" press. */
export function nextTermCount(current: number, max: number): number {
  const bump = Math.max(32, Math.min(200, Math.floor(current * 0.5)));
  return Math.min(max, current + bump);
}

export function initialTermCount(sequence: OEISSequence): number {
  if (sequence.vizType) return VIZ_DEFAULT_COUNT[sequence.vizType];
  return sequence.terms?.length ?? 0;
}

export function maxTermCount(sequence: OEISSequence, bfileUnavailable: boolean): number {
  if (sequence.vizType) return VIZ_MAX_COUNT[sequence.vizType];
  const have = sequence.terms?.length ?? 0;
  if (bfileUnavailable) return have;
  return Math.max(have, MAX_BFILE_TERMS);
}

export function buildDisplaySequence(
  sequence: OEISSequence,
  termCount: number
): OEISSequence {
  if (sequence.vizType) {
    const terms = sequence.generate
      ? sequence.generate(termCount).map(String)
      : sequence.terms?.slice(0, termCount);
    return terms ? { ...sequence, terms } : sequence;
  }
  if (!sequence.terms?.length) return sequence;
  return { ...sequence, terms: sequence.terms.slice(0, termCount) };
}
