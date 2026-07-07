// src/oeis/fetchEntry.ts
//
// Fetches the full OEIS entry over the network (CC BY-SA 4.0).

import type { OEISFullEntry, OeisJsonRecord } from "./entryTypes";
import { formatAnum, normalizeAnum, parseKeywords } from "./entryText";
import { OEIS_BASE } from "./baseUrl";

const cache = new Map<string, OEISFullEntry>();

function mapRecord(raw: OeisJsonRecord): OEISFullEntry {
  const anum = formatAnum(raw.number);
  return {
    anum,
    legacyId: raw.id && !/^A\d/i.test(raw.id) ? raw.id : undefined,
    name: raw.name ?? "",
    data: raw.data ?? "",
    offset: raw.offset,
    author: raw.author,
    keyword: parseKeywords(raw.keyword),
    comment: raw.comment ?? [],
    formula: raw.formula ?? [],
    example: raw.example ?? [],
    reference: raw.reference ?? [],
    link: raw.link ?? [],
    xref: raw.xref ?? [],
    maple: raw.maple ?? [],
    mathematica: raw.mathematica ?? [],
    program: raw.program ?? [],
    ext: raw.ext ?? [],
    created: raw.created,
    revision: raw.revision,
    time: raw.time,
  };
}

export async function fetchOeisEntry(anum: string): Promise<OEISFullEntry | null> {
  const key = normalizeAnum(anum);
  const hit = cache.get(key);
  if (hit) return hit;

  try {
    const res = await fetch(`${OEIS_BASE}/search?q=id:${key}&fmt=json`);
    if (!res.ok) return null;
    const data = (await res.json()) as OeisJsonRecord[];
    if (!Array.isArray(data) || data.length === 0) return null;
    const entry = mapRecord(data[0]);
    cache.set(key, entry);
    return entry;
  } catch {
    return null;
  }
}
