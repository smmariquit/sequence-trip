// src/sequences/metadata.ts
//
// Beginner-friendly sequence metadata: math field tags (#3) and difficulty
// of understanding (#7). Phase A: curated map for well-known sequences plus
// a name-keyword heuristic for everything else (#5/#9 phased approach).

export type MathFieldId =
  | "number-theory"
  | "combinatorics"
  | "geometry"
  | "analysis"
  | "algebra"
  | "probability"
  | "recreational"
  | "fractals";

export interface MathField {
  label: string;
  /** One-liner for tooltips / About glossary. */
  description: string;
  /** Chip dot color — consistent per field across the app. */
  color: string;
}

export const MATH_FIELDS: Record<MathFieldId, MathField> = {
  "number-theory": {
    label: "Number theory",
    description: "Primes, divisors, and the hidden structure of whole numbers.",
    color: "#56E8FF",
  },
  combinatorics: {
    label: "Combinatorics",
    description: "Counting arrangements: how many ways can things combine?",
    color: "#39FF14",
  },
  geometry: {
    label: "Geometry",
    description: "Shapes, spirals, and where numbers land in space.",
    color: "#FFE62B",
  },
  analysis: {
    label: "Analysis",
    description: "Constants like π and e, limits, and digit expansions.",
    color: "#FF6B2B",
  },
  algebra: {
    label: "Algebra",
    description: "Polynomials, coefficients, and symbolic structure.",
    color: "#C4B5FD",
  },
  probability: {
    label: "Probability",
    description: "Randomness, expected values, and statistical patterns.",
    color: "#FF4A8D",
  },
  recreational: {
    label: "Recreational",
    description: "Puzzles and playful rules. Math for the fun of it.",
    color: "#B44AFF",
  },
  fractals: {
    label: "Fractals",
    description: "Self-similar patterns that repeat at every scale.",
    color: "#00FFCC",
  },
};

export type DifficultyId = "beginner" | "intermediate" | "advanced";

export interface Difficulty {
  label: string;
  /** Tooltip / glossary copy. */
  description: string;
  /** Badge tint — calm, not traffic-light alarmist. */
  color: string;
}

export const DIFFICULTY: Record<DifficultyId, Difficulty> = {
  beginner: {
    label: "Beginner",
    description: "You can follow this with basic counting.",
    color: "#2DD4BF",
  },
  intermediate: {
    label: "Intermediate",
    description: "Some math vocabulary helps, but the viz carries you.",
    color: "#60A5FA",
  },
  advanced: {
    label: "Advanced",
    description: "Deep waters: easy to state, subtle to grasp.",
    color: "#F0ABFC",
  },
};

export interface SequenceMeta {
  fields: MathFieldId[];
  difficulty?: DifficultyId;
}

/** Curated metadata — difficulty measures how easy the RULE is to grasp,
 * not proof hardness. Extend freely; heuristic covers the rest. */
const CURATED: Record<string, SequenceMeta> = {
  A000045: { fields: ["combinatorics", "number-theory"], difficulty: "beginner" }, // Fibonacci
  A005132: { fields: ["recreational"], difficulty: "beginner" }, // Recamán
  A000040: { fields: ["number-theory"], difficulty: "intermediate" }, // Primes
  A006577: { fields: ["number-theory", "recreational"], difficulty: "intermediate" }, // Collatz steps
  A007318: { fields: ["combinatorics", "fractals"], difficulty: "beginner" }, // Pascal
  A000796: { fields: ["analysis"], difficulty: "beginner" }, // π digits
  A000079: { fields: ["combinatorics"], difficulty: "beginner" }, // 2^n
  A000142: { fields: ["combinatorics"], difficulty: "beginner" }, // n!
  A000108: { fields: ["combinatorics"], difficulty: "intermediate" }, // Catalan
  A000217: { fields: ["combinatorics", "geometry"], difficulty: "beginner" }, // triangular
  A000002: { fields: ["recreational"], difficulty: "advanced" }, // Kolakoski
  A004001: { fields: ["recreational"], difficulty: "advanced" }, // Hofstadter-Conway
  A005185: { fields: ["recreational"], difficulty: "advanced" }, // Hofstadter Q
  A006336: { fields: ["recreational", "geometry"], difficulty: "advanced" },
  A001113: { fields: ["analysis"], difficulty: "beginner" }, // e digits
  A002193: { fields: ["analysis"], difficulty: "beginner" }, // sqrt(2) digits
  A010060: { fields: ["recreational", "fractals"], difficulty: "intermediate" }, // Thue-Morse
  A007376: { fields: ["recreational"], difficulty: "beginner" }, // Champernowne
  A023811: { fields: ["fractals"], difficulty: "intermediate" },
  A001358: { fields: ["number-theory"], difficulty: "intermediate" }, // semiprimes
  A000961: { fields: ["number-theory"], difficulty: "intermediate" }, // prime powers
  A002378: { fields: ["number-theory", "geometry"], difficulty: "beginner" }, // oblong
  A001097: { fields: ["number-theory"], difficulty: "intermediate" }, // twin primes
  A005384: { fields: ["number-theory"], difficulty: "advanced" }, // Sophie Germain
  A000035: { fields: ["number-theory"], difficulty: "beginner" }, // parity
  A000959: { fields: ["number-theory", "recreational"], difficulty: "intermediate" }, // lucky
};

/** Name-keyword heuristic (#5 option 3) — fallback when not curated. */
const NAME_RULES: [RegExp, MathFieldId][] = [
  [/\bprimes?\b|divisor|factor|gcd|totient|congruen|modul|semiprime/i, "number-theory"],
  [/partition|permutation|binomial|catalan|combinat|number of ways|count of|arrangement/i, "combinatorics"],
  [/triangl|polygon|lattice|geometr|circle|sphere|hexagon/i, "geometry"],
  [/decimal expansion|digits? of|continued fraction|limit|convergen/i, "analysis"],
  [/polynomial|coefficient|matrix|group|determinant|character/i, "algebra"],
  [/random|probabilit|expected|distribution/i, "probability"],
  [/sierpinski|fractal|self-similar|cantor|dragon/i, "fractals"],
];

export function fieldsFromName(name: string): MathFieldId[] {
  const out: MathFieldId[] = [];
  for (const [re, id] of NAME_RULES) {
    if (re.test(name) && !out.includes(id)) out.push(id);
  }
  return out.slice(0, 2);
}

/** Metadata for any sequence: curated when known, name heuristic otherwise.
 * Difficulty only appears when curated — guessing it would mislead. */
export function metadataFor(anum: string, name?: string): SequenceMeta {
  const curated = CURATED[anum];
  if (curated) return curated;
  return { fields: name ? fieldsFromName(name) : [] };
}

/** One-line plain-language explanations for browse cards. OEIS names are
 * definitions, not introductions; beginners need to know what the thing IS. */
const BLURBS: Record<string, string> = {
  A000045: "Each number is the sum of the previous two. Shows up in pinecones and sunflowers.",
  A005132: "Jump backward if you can, forward if you must. Never lands on the same number twice.",
  A000040: "The primes: numbers only divisible by 1 and themselves.",
  A006577: "Halve if even, triple-plus-one if odd. Counts the steps until you hit 1.",
  A007318: "Pascal's triangle: every entry is the sum of the two above it.",
  A000796: "The digits of π, one at a time.",
  A000079: "Doubling: 1, 2, 4, 8, 16. Growth by powers of two.",
  A000142: "Factorials: multiply all numbers up to n. Counts ways to order things.",
  A000108: "Catalan numbers: count valid bracketings, mountain paths, and much more.",
  A000217: "Triangular numbers: dots stacked in triangles, 1, 3, 6, 10.",
  A000002: "A sequence that describes its own run lengths. Deeply strange.",
  A004001: "A recursion that feeds on itself. Chaotic then oddly regular.",
  A005185: "Hofstadter's Q: like Fibonacci but the offsets come from the sequence itself.",
  A006336: "Grows by its own count of earlier terms. Geometry hides inside.",
  A001113: "The digits of e, the base of natural growth.",
  A002193: "The digits of the square root of 2, the first known irrational.",
  A010060: "Thue-Morse: flip 0s and 1s forever. Never repeats a block three times.",
  A007376: "Write the counting numbers in a row and read the digits: 1, 2, 3, ..., 1, 0, 1, 1.",
  A023811: "Base-b repunits: numbers written as all 1s, generalized.",
  A001358: "Semiprimes: products of exactly two primes.",
  A000961: "Prime powers: primes and their squares, cubes, and beyond.",
  A002378: "Oblong numbers: n times (n+1). Twice the triangular numbers.",
  A001097: "Twin primes: primes that differ by 2, like 11 and 13.",
  A005384: "Sophie Germain primes: p where 2p+1 is also prime.",
  A000035: "0, 1, 0, 1: the parity of n. The simplest possible pattern.",
  A000959: "Lucky numbers: survivors of a sieve like the primes', but by position.",
  A000032: "Lucas numbers: Fibonacci's sibling, starting 2, 1 instead of 0, 1.",
  A000290: "The perfect squares: 1, 4, 9, 16.",
  A000326: "Pentagonal numbers: dots arranged in nested pentagons.",
  A000120: "How many 1s are in n written in binary.",
  A003188: "Gray code: each number differs from the last by a single binary digit.",
  A000931: "Padovan: like Fibonacci, but you add the terms two and three back.",
  A001608: "Perrin: a(n) = a(n-2) + a(n-3). Detects primes in a surprising way.",
  A005843: "The even numbers.",
  A000292: "Tetrahedral numbers: cannonballs stacked in triangular pyramids.",
  A000004: "Zero. Forever. The OEIS catalogs it anyway.",
  A000012: "1, 1, 1, 1. All ones. That is the whole sequence.",
  A007395: "All twos. Somebody had to submit it.",
  A010701: "All threes. The saga continues.",
  A001477: "0, 1, 2, 3. Counting, starting at zero.",
  A000027: "1, 2, 3, 4. The natural numbers. The most important sequence there is.",
};

/** Plain-language one-liner for a sequence, when curated. */
export function blurbFor(anum: string): string | undefined {
  return BLURBS[anum];
}

/** A-numbers curated at a given difficulty — for browse groupings (#10). */
export function anumsByDifficulty(level: DifficultyId): string[] {
  return Object.keys(CURATED).filter((a) => CURATED[a].difficulty === level);
}
