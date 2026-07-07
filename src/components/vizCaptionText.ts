// src/components/vizCaptionText.ts

import type { OEISSequence } from "../sequences/types";
import { recaman, collatzSequence } from "../sequences/generators";
import { rankGenericViz, type GenericVizKey } from "../visualizations/generic/select";

export interface CaptionText {
  /** One-line playback status — always visible. */
  live: string;
  /** Full guide — shown when user expands the caption. */
  guide: string;
}

function formatCollatzTrail(start: number, maxTerms = 6): string {
  const seq = collatzSequence(start);
  if (seq.length <= maxTerms) return seq.join(" → ");
  return `${seq.slice(0, 3).join(" → ")} → … → 1`;
}

export function collatzCaption(step: number, maxBranches = 40): CaptionText {
  const branch = Math.min(Math.max(step, 0), maxBranches);
  const startN = branch > 0 ? branch + 1 : 2;

  return {
    live:
      branch === 0
        ? "Press Play. Paths appear one starting number at a time (n = 2, 3, 4, …)"
        : `Path ${branch}/${maxBranches} · start n = ${startN}: ${formatCollatzTrail(startN)}`,
    guide:
      "Collatz rule: even → divide by 2; odd → $3n+1$; repeat until $1$. Each colored branch is one full journey. Turns mark odd/even steps along the way. (OEIS A006577 lists how many steps each journey takes. This view draws the journeys.)",
  };
}

export function recamanCaption(step: number, terms?: string[]): CaptionText {
  const seq = terms?.length ? terms.map(Number) : recaman(64);
  const i = Math.min(Math.max(step, 0), seq.length - 1);

  return {
    live:
      step === 0
        ? "Press Play. Semicircles build the sequence from a(0) = 0"
        : `Step ${i}: a(${i}) = ${seq[i]}`,
    guide:
      "Values sit on a number line. Each semicircle connects $a(n-1)$ to $a(n)$ with radius $n$. Even steps arc up, odd steps arc down.",
  };
}

// rankGenericViz runs normalize() over every term; the caption re-renders
// each playback step, so cache the (constant per sequence) guide string.
const guideCache = new Map<string, string>();

function genericGuide(anum: string, terms: string[], vizKey?: GenericVizKey): string {
  const key = `${anum}:${terms.length}:${vizKey ?? ""}`;
  let guide = guideCache.get(key);
  if (!guide) {
    const ranked = rankGenericViz(terms);
    guide = (ranked.find((c) => c.key === vizKey) ?? ranked[0]).guide;
    guideCache.set(key, guide);
  }
  return guide;
}

export function genericCaption(
  sequence: OEISSequence,
  step: number,
  vizKey?: GenericVizKey
): CaptionText {
  const terms = sequence.terms ?? [];
  // same pick as VizPreview, so the guide matches what's drawn
  const guide = terms.length
    ? genericGuide(sequence.anum, terms, vizKey)
    : "Horizontal axis = index $n$. Vertical axis = $a(n)$ (log-scaled when values are huge).";
  return {
    live:
      step <= 0 || terms.length === 0
        ? "Press Play to reveal terms one by one"
        : `Term ${Math.min(step, terms.length)}: a(${Math.min(step, terms.length)}) = ${terms[Math.min(step, terms.length) - 1]}`,
    guide,
  };
}

const GUIDES: Partial<Record<string, string>> = {
  "fibonacci-spiral":
    "Dots at successive golden-angle turns, the same spacing as sunflower seed heads.",
  "ulam-spiral":
    "Integers spiral out from $1$; bright dots are primes, added one integer at a time.",
  "pascal-fractal":
    "Pascal's triangle mod $2$: odd entries light up, row by row (Sierpiński triangle).",
  "digit-flow":
    "Each digit of $\\pi$ steers the walker; the path extends one digit at a time.",
};

export function captionForSequence(
  sequence: OEISSequence,
  step: number,
  termCount?: number,
  genericVizKey?: GenericVizKey
): CaptionText {
  if (sequence.vizType === "recaman-arcs") {
    return recamanCaption(step, sequence.terms);
  }
  if (sequence.vizType === "collatz-tree") {
    return collatzCaption(step, termCount);
  }
  if (sequence.vizType) {
    const generic = genericCaption(sequence, step);
    return {
      live: generic.live,
      guide: GUIDES[sequence.vizType] ?? generic.guide,
    };
  }
  return genericCaption(sequence, step, genericVizKey);
}
