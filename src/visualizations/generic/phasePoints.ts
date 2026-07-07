// src/visualizations/generic/phasePoints.ts
//
// Shared point math for the phase-plane viz: (a(n), a(n+1)) in symlog space,
// scaled into a padded box. One copy for native and web.

export function phasePoints(
  logs: number[],
  minLog: number,
  maxLog: number,
  width: number,
  height: number,
  pad: number
): { x: number; y: number }[] {
  const range = maxLog - minLog || 1;
  const sx = (v: number) => pad + ((v - minLog) / range) * (width - pad * 2);
  const sy = (v: number) => height - pad - ((v - minLog) / range) * (height - pad * 2);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < logs.length; i++) {
    pts.push({ x: sx(logs[i]), y: sy(logs[i + 1]) });
  }
  return pts;
}
