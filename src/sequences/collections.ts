// src/sequences/collections.ts

export interface SequenceCollection {
  title: string;
  description: string;
  anums: string[];
}

export const COLLECTIONS: SequenceCollection[] = [
  {
    title: "Classics",
    description: "Spirals, squares, and the sequences every math person knows.",
    anums: ["A000045", "A000040", "A000079", "A000142", "A000108", "A000217"],
  },
  {
    title: "Chaotic & weird",
    description: "Strange rules, unpredictable paths, and beautifully messy behavior.",
    anums: ["A005132", "A006577", "A000002", "A004001", "A005185", "A006336"],
  },
  {
    title: "Digits & digits",
    description: "π, e, and other constants — one digit at a time.",
    anums: ["A000796", "A001113", "A002193", "A010060", "A007376", "A023811"],
  },
  {
    title: "Primes & friends",
    description: "Primes, gaps, and the integer sequences that orbit them.",
    anums: ["A000040", "A001358", "A000961", "A002378", "A001097", "A005384"],
  },
];
