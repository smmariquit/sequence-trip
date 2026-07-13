// src/sequences/catalog.ts

import type { OEISSequence, VizType } from "./types";
import * as gen from "./generators";

export const sequences: OEISSequence[] = [
  {
    anum: "A005132",
    name: "Recamán's Sequence",
    description:
      "Each term jumps back by n if the result is positive and not already in the sequence, otherwise it jumps forward by n. Consecutive terms plotted as alternating semicircles form nested arcs of uneven radius.",
    vizType: "recaman-arcs",
    generate: (n) => gen.recaman(n),
  },
  {
    anum: "A000045",
    name: "Fibonacci Spiral",
    description:
      "Points placed at successive golden-angle intervals (137.5077640500378°) reproduce the phyllotaxis spacing seen in sunflower seed heads and pinecones.",
    vizType: "fibonacci-spiral",
    generate: (n) => gen.fibonacci(n),
  },
  {
    anum: "A000040",
    name: "Ulam Prime Spiral",
    description:
      "Integers arranged outward in a square spiral from 1, with primes marked. Ulam noticed the primes clustering on diagonals while sketching this grid in 1963; Martin Gardner covered the finding in Scientific American the next year.",
    vizType: "ulam-spiral",
    generate: (n) => gen.primes(n),
  },
  {
    anum: "A006577",
    name: "Collatz Trajectories",
    description:
      "The Collatz conjecture: repeat “halve if even, otherwise 3n+1” until you reach 1. Believed to always work, but unproven. This viz draws each starting number’s path as a branch; the OEIS entry counts steps to finish.",
    vizType: "collatz-tree",
    generate: (n) => gen.collatzLengths(n),
  },
  {
    anum: "A007318",
    name: "Pascal's Fractal",
    description:
      "Pascal's triangle reduced modulo 2 marks every odd entry. The resulting pattern matches the Sierpiński triangle exactly, self-similar at every scale of magnification.",
    vizType: "pascal-fractal",
    generate: (n) => gen.pascalRow(n),
  },
  {
    anum: "A000796",
    name: "Digit River of pi",
    description:
      "Each digit of $\\pi$ turns a walker left, right, or straight. The digits pass every statistical test for randomness applied so far, but no proof of that randomness exists.",
    vizType: "digit-flow",
    generate: (n) => gen.piDigits(n),
  },
];

export function getSequence(anum: string): OEISSequence | undefined {
  return sequences.find((s) => s.anum === anum);
}

export function getVizType(anum: string): VizType | undefined {
  return sequences.find((s) => s.anum === anum)?.vizType;
}
