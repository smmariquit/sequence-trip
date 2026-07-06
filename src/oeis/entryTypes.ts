// src/oeis/entryTypes.ts
//
// Full OEIS record from search?fmt=json (see oeis.org/eishelp2.html).

export interface OEISFullEntry {
  anum: string;
  /** Legacy M-/N-number when present. */
  legacyId?: string;
  name: string;
  data: string;
  offset?: string;
  author?: string;
  keyword: string[];
  comment: string[];
  formula: string[];
  example: string[];
  reference: string[];
  link: string[];
  xref: string[];
  maple: string[];
  mathematica: string[];
  program: string[];
  ext: string[];
  created?: string;
  revision?: string;
  time?: string;
}

/** Raw shape returned by oeis.org/search?fmt=json (one result). */
export interface OeisJsonRecord {
  number: number;
  id?: string;
  data?: string;
  name?: string;
  comment?: string[];
  reference?: string[];
  link?: string[];
  formula?: string[];
  example?: string[];
  maple?: string[];
  mathematica?: string[];
  program?: string[];
  xref?: string[];
  keyword?: string;
  offset?: string;
  author?: string;
  ext?: string[];
  created?: string;
  revision?: string;
  time?: string;
}
