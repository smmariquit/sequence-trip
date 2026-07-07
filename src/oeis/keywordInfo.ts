// src/oeis/keywordInfo.ts
//
// Plain-language meanings for OEIS entry keywords.
// Source: oeis.org/wiki/Keywords (paraphrased).

export const KEYWORD_INFO: Record<string, string> = {
  nonn: "No negative terms.",
  sign: "Has negative terms.",
  easy: "Easy to compute and understand.",
  core: "One of the most important sequences in the OEIS.",
  nice: "Flagged by OEIS editors as exceptionally interesting.",
  hard: "Computing more terms is hard — some may be unknown.",
  more: "More terms are wanted; only a few are known.",
  base: "Depends on the number base (usually base 10).",
  cons: "Digits of a decimal constant.",
  cofr: "A continued fraction expansion.",
  frac: "Numerators or denominators of a fraction sequence.",
  tabl: "A table read row by row — a(n) forms a regular triangle.",
  tabf: "A table with irregular row lengths, read row by row.",
  mult: "Multiplicative: a(m·n) = a(m)·a(n) when m and n share no factors.",
  fini: "Finite — the sequence ends.",
  full: "Finite and every term is listed.",
  bref: "Too few terms listed to say much.",
  eigen: "An eigensequence — fixed by some transformation.",
  look: "The plot shows interesting structure.",
  hear: "Worth listening to — the OEIS has audio for it.",
  less: "Less interesting; kept for completeness.",
  obsc: "The definition is obscure or unclear.",
  uned: "Not yet edited by OEIS editors.",
  unkn: "The rule that generates it is unknown.",
  walk: "Counts walks or paths on a lattice or graph.",
  word: "Depends on the words of a specific language.",
  dead: "An error or duplicate, kept so references still resolve.",
  dumb: "Included despite being unimportant (e.g. from popular culture).",
  dupe: "Duplicate of another sequence.",
  new: "Added or substantially changed recently.",
  changed: "Changed recently.",
  probation: "Included provisionally; may be deleted.",
  allocated: "A-number reserved; entry not written yet.",
  recycled: "A-number freed for reuse after a deletion.",
};

export function keywordMeaning(keyword: string): string | undefined {
  return KEYWORD_INFO[keyword.trim().toLowerCase()];
}
