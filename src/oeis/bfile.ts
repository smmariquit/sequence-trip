// src/oeis/bfile.ts
//
// On-demand fetch of OEIS b-files (thousands of terms) with a file cache.
// b-file format: "n a(n)" per line, # comments.

import { Platform } from "react-native";

export const MAX_BFILE_TERMS = 2000;

const webCache = new Map<string, string>();

function parseBfile(text: string): string[] | null {
  const terms: string[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const parts = t.split(/\s+/);
    if (parts.length >= 2) terms.push(parts[1]);
    if (terms.length >= MAX_BFILE_TERMS) break;
  }
  return terms.length > 0 ? terms : null;
}

async function downloadBfile(anum: string): Promise<string | null> {
  const num = anum.slice(1);
  try {
    const res = await fetch(`https://oeis.org/${anum}/b${num}.txt`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchMoreTermsWeb(anum: string): Promise<string[] | null> {
  let text = webCache.get(anum);
  if (!text) {
    text = (await downloadBfile(anum)) ?? undefined;
    if (!text) return null;
    webCache.set(anum, text);
  }
  return parseBfile(text);
}

async function fetchMoreTermsNative(anum: string): Promise<string[] | null> {
  const { File, Directory, Paths } = await import("expo-file-system");
  const dir = new Directory(Paths.cache, "bfiles");
  const cached = new File(dir, `${anum}.txt`);
  let text: string;
  if (cached.exists) {
    text = await cached.text();
  } else {
    const downloaded = await downloadBfile(anum);
    if (!downloaded) return null;
    text = downloaded;
    if (!dir.exists) dir.create({ intermediates: true });
    cached.write(text);
  }
  return parseBfile(text);
}

export async function fetchMoreTerms(anum: string): Promise<string[] | null> {
  if (Platform.OS === "web") return fetchMoreTermsWeb(anum);
  return fetchMoreTermsNative(anum);
}
