// src/visualizations/recamanLayout.ts
//
// Shared Recamán geometry for native and web: static full-walk scale,
// walk line placed by the actual up/down arc extents, axis clear of the
// caption overlay.

export interface RecamanLayout {
  /** x of value 0 on the number line (plot is centered when narrow). */
  x0: number;
  axisY: number;
  midY: number;
  scaleX: number;
  /** pixel width of the number line (maxVal * scaleX). */
  span: number;
  maxVal: number;
}

export function layoutRecaman(
  seq: number[],
  width: number,
  height: number,
  preview: boolean
): RecamanLayout {
  const basePad = preview ? 8 : 24;
  // full view: axis tick labels sit below the line, so the line itself must
  // clear the caption bar (~56px) plus label height
  const axisY = height - (preview ? 14 : 76);
  const padTop = preview ? 6 : 16;
  const usable = axisY - padTop - (preview ? 2 : 10);
  const maxVal = Math.max(...seq, 1);

  // arcs alternate: even steps arc up, odd steps arc down. Size the scale by
  // the SUM of the tallest up-arc and tallest down-arc, then place the walk
  // line so both extremes just fit. Splitting the height 50/50 wasted the
  // half that had only small arcs.
  let maxUp = 1;
  let maxDown = 1;
  for (let i = 1; i < seq.length; i++) {
    const jump = Math.abs(seq[i] - seq[i - 1]);
    // even arc indices render below the walk line in canvas coordinates
    // (y grows downward), odd ones above
    if ((i - 1) % 2 === 0) maxDown = Math.max(maxDown, jump);
    else maxUp = Math.max(maxUp, jump);
  }

  const fullSpan = width - basePad * 2;
  const scaleX = Math.min(fullSpan / maxVal, (2 * usable) / (maxUp + maxDown));
  const midY = padTop + (maxUp * scaleX) / 2;
  const x0 = basePad + (fullSpan - maxVal * scaleX) / 2;
  return { x0, axisY, midY, scaleX, span: maxVal * scaleX, maxVal };
}
