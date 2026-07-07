// src/sequences/normalize.ts
//
// OEIS terms routinely exceed Number range, so plotting works from
// string terms via approximate signed log10 — exact enough for pixels.

export interface SeqStats {
  terms: string[];
  /** Approximate numeric values; ±Infinity for terms beyond ~1e308. */
  values: number[];
  /** Signed magnitude: sign * log10(1 + |value|), finite for any term. */
  logs: number[];
  min: number;
  max: number;
  minLog: number;
  maxLog: number;
  hasNegative: boolean;
  /** Small non-negative integer range — raster/mod visualizations apply. */
  smallRange: boolean;
}

function approxValue(t: string): number {
  if (t.length <= 15) return Number(t);
  const neg = t.startsWith("-");
  const digits = neg ? t.slice(1) : t;
  const v = Number(digits.slice(0, 15)) * Math.pow(10, digits.length - 15);
  return neg ? -v : v;
}

function signedLog(t: string): number {
  const neg = t.startsWith("-");
  const digits = neg ? t.slice(1) : t;
  // log10(d0.d1d2... * 10^(len-1))
  const lead = Number(digits.slice(0, 15)) / Math.pow(10, Math.min(digits.length, 15) - 1);
  const log = digits === "0" ? 0 : Math.log10(1 + lead) + (digits.length - 1);
  return neg ? -log : log;
}

/**
 * Symlog with a per-sequence linear threshold (Webber 2013 / d3.scaleSymlog):
 * sign * log10(1 + |v|/C). Fitting C to the smallest nonzero |term| stops
 * near-zero-dense sequences rendering as a squashed band.
 */
function symlog(t: string, threshold: number): number {
  const v = approxValue(t);
  if (Number.isFinite(v)) {
    return Math.sign(v) * Math.log10(1 + Math.abs(v) / threshold);
  }
  // beyond double range: log10(1 + |v|/C) ≈ log10(|v|) - log10(C)
  return signedLog(t) - Math.sign(v) * Math.log10(threshold);
}

/** Smallest nonzero |value|, clamped to [1e-12, 1e12]; 1 when none. */
function fitThreshold(values: number[]): number {
  let min = Infinity;
  for (const v of values) {
    const a = Math.abs(v);
    if (a > 0 && a < min) min = a;
  }
  return Number.isFinite(min) ? Math.min(Math.max(min, 1e-12), 1e12) : 1;
}

export function normalize(terms: string[]): SeqStats {
  const clean = terms.filter((t) => /^-?\d+$/.test(t));
  const values = clean.map(approxValue);
  const threshold = fitThreshold(values);
  const logs = clean.map((t) => symlog(t, threshold));
  const finite = values.filter(Number.isFinite);
  const min = Math.min(...finite, 0);
  const max = Math.max(...finite, 0);
  const hasNegative = min < 0;
  const smallRange = !hasNegative && max <= 100 && new Set(values).size <= 32;
  return {
    terms: clean,
    values,
    logs,
    min,
    max,
    minLog: Math.min(...logs, 0),
    maxLog: Math.max(...logs, 0),
    hasNegative,
    smallRange,
  };
}

/** term mod n from the digit string — safe for arbitrarily large terms. */
export function termMod(t: string, n: number): number {
  const neg = t.startsWith("-");
  const digits = neg ? t.slice(1) : t;
  let m = 0;
  for (let i = 0; i < digits.length; i++) {
    m = (m * 10 + (digits.charCodeAt(i) - 48)) % n;
  }
  return neg ? (n - m) % n : m;
}

/** Concatenated decimal digits of all terms (signs dropped). */
export function allDigits(terms: string[], limit = 1200): number[] {
  const out: number[] = [];
  for (const t of terms) {
    for (const ch of t) {
      if (ch >= "0" && ch <= "9") out.push(ch.charCodeAt(0) - 48);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** First differences as signed logs (BigInt only when Number would overflow). */
export function deltaLogs(terms: string[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < terms.length; i++) {
    const a = terms[i - 1];
    const b = terms[i];
    if (a.length < 15 && b.length < 15) {
      const d = Number(b) - Number(a);
      out.push(Math.sign(d) * Math.log10(1 + Math.abs(d)));
    } else {
      const d = BigInt(b) - BigInt(a);
      const s = d < 0n ? -1 : d > 0n ? 1 : 0;
      const str = (d < 0n ? -d : d).toString();
      out.push(s * signedLog(str));
    }
  }
  return out;
}
