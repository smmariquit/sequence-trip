// src/oeis/baseUrl.ts
//
// oeis.org sends no CORS headers, so browser fetches are blocked.
// Web goes through the Vercel rewrite proxy (see vercel.json); native hits it directly.

import { Platform } from "react-native";

export const OEIS_BASE = Platform.OS === "web" ? "/oeis" : "https://oeis.org";

/** Identifying UA on native (oeis.org blocks some generic clients);
 * browsers forbid setting User-Agent, so web sends none. */
export const OEIS_HEADERS: Record<string, string> | undefined =
  Platform.OS === "web"
    ? undefined
    : { "User-Agent": "sequence-trip/1.0 (OEIS visualization app)" };
