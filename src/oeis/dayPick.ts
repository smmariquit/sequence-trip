// src/oeis/dayPick.ts
//
// Pure date-to-rowid mapping for "sequence of the day". No db, no RN imports,
// so the headless widget task and unit tests can use it. The rowid still has
// to be looked up against the opened db elsewhere; this only picks WHICH row.

/** Rolling char hash, matches the historical sequenceOfTheDay. */
export function dayHash(dateISO: string): number {
  let h = 0;
  for (const ch of dateISO) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** The rowid the given date maps to, in 1..maxRowid. */
export function rowidForDate(dateISO: string, maxRowid: number): number {
  return (dayHash(dateISO) % maxRowid) + 1;
}

/** YYYY-MM-DD for today+offset days, UTC (same basis as the original sotd).
 * ponytail: UTC basis kept for parity with existing picks. A user far from
 * UTC sees the edge day flip a few hours early/late; switch to local date
 * only if someone complains. */
export function isoDate(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
}
