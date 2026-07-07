// src/audio/termsAtStep.ts

import type { OEISSequence } from "../sequences/types";
import * as gen from "../sequences/generators";
import { intString } from "../sequences/normalize";

const GENERATED_LEN = 120;

function generatedTerms(sequence: OEISSequence): string[] {
  if (sequence.generate) {
    return sequence.generate(GENERATED_LEN).map(intString);
  }
  switch (sequence.vizType) {
    case "recaman-arcs":
      return gen.recaman(GENERATED_LEN).map(intString);
    case "fibonacci-spiral":
      return gen.fibonacci(GENERATED_LEN).map(intString);
    case "ulam-spiral":
      return gen.primes(GENERATED_LEN).map(intString);
    case "collatz-tree":
      return gen.collatzLengths(GENERATED_LEN).map(intString);
    case "pascal-fractal":
      return gen.pascalRow(GENERATED_LEN - 1).map(intString);
    case "digit-flow":
      return gen.piDigits(GENERATED_LEN).map(intString);
    default:
      return [];
  }
}

/** Resolve a(n) and a(n-1) for sonification at construction step n (1-based). */
export function termsAtStep(
  sequence: OEISSequence,
  step: number
): { term: string; prevTerm?: string } | null {
  if (step <= 0) return null;

  const fromSeq = sequence.terms?.length ? sequence.terms : generatedTerms(sequence);
  if (!fromSeq.length) return null;

  const idx = Math.min(step, fromSeq.length) - 1;
  const term = fromSeq[idx];
  const prevTerm = idx > 0 ? fromSeq[idx - 1] : undefined;
  return { term, prevTerm };
}
