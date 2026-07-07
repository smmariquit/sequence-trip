// src/visualizations/canvasAxes.ts
//
// Shared axis / number-line drawing for HTML5 Canvas visualizations.

export function drawNumberLine(
  ctx: CanvasRenderingContext2D,
  opts: {
    x0: number;
    y: number;
    span: number;
    maxVal: number;
    preview?: boolean;
    /** Theme ink for axis lines/labels — hardcoded light ink vanishes on light bg. */
    ink?: string;
  }
) {
  const { x0, y, span, maxVal, preview, ink = "rgba(240, 236, 255, 0.55)" } = opts;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 1;
  ctx.font = preview ? "9px system-ui, sans-serif" : "12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x0 + span, y);
  ctx.stroke();

  const ticks = preview ? 3 : 5;
  for (let i = 0; i <= ticks; i++) {
    const v = Math.round((maxVal * i) / ticks);
    const x = x0 + (span * i) / ticks;
    ctx.beginPath();
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x, y + 5);
    ctx.stroke();
    if (!preview || i === 0 || i === ticks) {
      ctx.fillText(String(v), x, y + 8);
    }
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

export function drawPlotAxes(
  ctx: CanvasRenderingContext2D,
  opts: {
    pad: number;
    width: number;
    height: number;
    xLabel: string;
    yLabel: string;
    preview?: boolean;
    ink?: string;
  }
) {
  const { pad, width, height, xLabel, yLabel, preview, ink = "rgba(240, 236, 255, 0.5)" } = opts;
  if (preview) return;

  const left = pad;
  const bottom = height - pad;
  const right = width - pad;
  const top = pad;

  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1;
  ctx.font = "11px system-ui, sans-serif";

  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.moveTo(left, bottom);
  ctx.lineTo(left, top);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillText(xLabel, (left + right) / 2, bottom + 10);
  ctx.save();
  ctx.translate(left - 14, (top + bottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}
