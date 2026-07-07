// src/sequences/collections.ts

import { anumsByDifficulty } from "./metadata";

export interface SequenceCollection {
  title: string;
  description: string;
  anums: string[];
}

export const COLLECTIONS: SequenceCollection[] = [
  {
    title: "Start here",
    description: "Beginner-friendly rules you can follow with basic counting.",
    anums: anumsByDifficulty("beginner").slice(0, 6),
  },
  {
    title: "Next steps",
    description: "A little math vocabulary helps. The visualizations carry you.",
    anums: anumsByDifficulty("intermediate").slice(0, 6),
  },
  {
    title: "Deep dives",
    description: "Easy to state, deeply subtle. Advanced rabbit holes.",
    anums: anumsByDifficulty("advanced").slice(0, 6),
  },
  {
    title: "Classics",
    description: "Spirals, squares, and the sequences every math person knows.",
    anums: ["A000045", "A000040", "A000079", "A000142", "A000108", "A000217"],
  },
  {
    title: "Chaotic & weird",
    description: "Strange rules and unpredictable paths.",
    anums: ["A005132", "A006577", "A000002", "A004001", "A005185", "A006336"],
  },
  {
    title: "Digits & digits",
    description: "π, e, and other constants, one digit at a time.",
    anums: ["A000796", "A001113", "A002193", "A010060", "A007376", "A023811"],
  },
  {
    title: "Primes & friends",
    description: "Primes, gaps, and the integer sequences that orbit them.",
    anums: ["A000040", "A001358", "A000961", "A002378", "A001097", "A005384"],
  },
  {
    title: "Counting & shapes",
    description: "Squares, triangles, pyramids: numbers you can draw with dots.",
    anums: ["A000290", "A000217", "A000326", "A000292", "A002378", "A000108"],
  },
  {
    title: "Famous recursions",
    description: "Each term built from earlier ones. Fibonacci is just the start.",
    anums: ["A000045", "A000032", "A000931", "A001608", "A004001", "A005185"],
  },
  {
    title: "Binary & bits",
    description: "What numbers look like in base 2.",
    anums: ["A000120", "A003188", "A010060", "A000079", "A007376", "A000035"],
  },
  {
    title: "Gloriously stupid",
    description: "Sequences that exist anyway. The OEIS keeps them, so do we.",
    anums: ["A000004", "A000012", "A007395", "A010701", "A001477", "A000027"],
  },
];
