// src/visualizations/recamanLayout.ts
//
// Shared Recamán geometry for native and web: static full-walk scale,
// walk line centered above the axis, axis clear of the caption overlay.

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
  const axisY = height - (preview ? 14 : 56);
  const usable = axisY - (preview ? 6 : 16);
  const midY = usable / 2 + (preview ? 3 : 8);
  const maxVal = Math.max(...seq, 1);
  const fullSpan = width - basePad * 2;
  const scaleX = Math.min(fullSpan, usable) / maxVal;
  const x0 = basePad + (fullSpan - maxVal * scaleX) / 2;
  return { x0, axisY, midY, scaleX, span: maxVal * scaleX, maxVal };
}
