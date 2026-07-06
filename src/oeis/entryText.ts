// src/oeis/entryText.ts

/** Strip OEIS wiki italics markup (_name_) for plain display. */
export function stripOeisMarkup(text: string): string {
  return text.replace(/_([^_]+)_/g, "$1");
}

export interface ParsedOeisLink {
  label: string;
  url?: string;
}

/** Parse OEIS link lines that may contain simple HTML anchors. */
export function parseOeisLink(line: string): ParsedOeisLink {
  const href = line.match(/href="([^"]+)"/i)?.[1];
  const inner = line.match(/>([^<]+)</)?.[1];
  const label = stripOeisMarkup(inner ?? line.replace(/<[^>]+>/g, "").trim());
  if (!href) return { label };
  const url = href.startsWith("http") ? href : `https://oeis.org${href.startsWith("/") ? href : `/${href}`}`;
  return { label, url };
}

/** Extract A-numbers from cross-reference text. */
export function extractAnums(text: string): string[] {
  const hits = text.match(/A\d{6}/g);
  if (!hits) return [];
  return [...new Set(hits)];
}

export function parseKeywords(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

export function formatAnum(number: number): string {
  return `A${String(number).padStart(6, "0")}`;
}

export function normalizeAnum(anum: string): string {
  const m = anum.trim().toUpperCase().match(/^A(\d{1,6})$/);
  if (!m) return anum.toUpperCase();
  return formatAnum(Number(m[1]));
}
