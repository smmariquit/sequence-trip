// src/sequences/catalog.ts

import type { OEISSequence, VizType } from "./types";
import * as gen from "./generators";

export const sequences: OEISSequence[] = [
  {
    anum: "A005132",
    name: "Recamán's Sequence",
    description:
      "Each term jumps back by n if the result is positive and new, otherwise jumps forward. Creates hauntingly beautiful nested arcs.",
    vizType: "recaman-arcs",
    generate: (n) => gen.recaman(n),
  },
  {
    anum: "A000045",
    name: "Fibonacci Spiral",
    description:
      "The golden sequence of nature. Points placed at golden angle intervals create a sunflower-like phyllotaxis pattern.",
    vizType: "fibonacci-spiral",
    generate: (n) => gen.fibonacci(n),
  },
  {
    anum: "A000040",
    name: "Ulam Prime Spiral",
    description:
      "Integers spiraled outward with primes highlighted. Mysterious diagonal lines emerge from the chaos of prime distribution.",
    vizType: "ulam-spiral",
    generate: (n) => gen.primes(n),
  },
  {
    anum: "A006577",
    name: "Collatz Trajectories",
    description:
      "Every number eventually reaches 1 — but the paths there are wild. Watch the tree of trajectories branch and flow.",
    vizType: "collatz-tree",
    generate: (n) => gen.collatzLengths(n),
  },
  {
    anum: "A007318",
    name: "Pascal's Fractal",
    description:
      "Pascal's triangle modulo small numbers reveals hidden Sierpiński fractals. Psychedelic self-similarity at every scale.",
    vizType: "pascal-fractal",
    generate: (n) => gen.pascalRow(n),
  },
  {
    anum: "A000796",
    name: "Digit River of π",
    description:
      "The digits of pi flow like a river — each digit steers the current. An infinite meandering walk through randomness.",
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
