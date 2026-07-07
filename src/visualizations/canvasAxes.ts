// src/visualizations/canvasAxes.ts
//
// Shared axis / number-line drawing for HTML5 Canvas visualizations.

/** Text with a translucent dark pill behind it — readable over neon strokes. */
export function drawBackedLabel(
  ctx: CanvasRenderingContext2D,
  opts: {
    text: string;
    /** anchor: left edge (align left) or center (align center), vertical middle */
    x: number;
    y: number;
    fg: string;
    /** pill color — pass the theme background */
    bg: string;
    size?: number;
    weight?: string;
    align?: "left" | "center";
  }
) {
  const { text, x, y, fg, bg, size = 15, weight = "600", align = "left" } = opts;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  const w = ctx.measureText(text).width;
  const padX = 5;
  const boxH = size + 8;
  const left = align === "center" ? x - w / 2 : x;

  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(left - padX, y - boxH / 2, w + padX * 2, boxH, 5);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, left, y + 0.5);
  ctx.textBaseline = "alphabetic";
}

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

export interface AxisTick {
  /** Pixel position: x for xTicks, y for yTicks. */
  pos: number;
  label: string;
}

export function drawPlotAxes(
  ctx: CanvasRenderingContext2D,
  opts: {
    pad: number | { left: number; right: number; top: number; bottom: number };
    width: number;
    height: number;
    xLabel: string;
    yLabel: string;
    preview?: boolean;
    ink?: string;
    xTicks?: AxisTick[];
    yTicks?: AxisTick[];
  }
) {
  const { pad, width, height, xLabel, yLabel, preview, ink = "rgba(240, 236, 255, 0.5)" } = opts;
  if (preview) return;

  const p =
    typeof pad === "number" ? { left: pad, right: pad, top: pad, bottom: pad } : pad;
  const left = p.left;
  const bottom = height - p.bottom;
  const right = width - p.right;
  const top = p.top;

  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 1;
  ctx.font = "13px system-ui, sans-serif";

  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.moveTo(left, bottom);
  ctx.lineTo(left, top);
  ctx.stroke();

  for (const t of opts.xTicks ?? []) {
    ctx.beginPath();
    ctx.moveTo(t.pos, bottom);
    ctx.lineTo(t.pos, bottom + 5);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(t.label, t.pos, bottom + 8);
  }
  for (const t of opts.yTicks ?? []) {
    ctx.beginPath();
    ctx.moveTo(left - 5, t.pos);
    ctx.lineTo(left, t.pos);
    ctx.stroke();
    // faint gridline so the eye can carry the value across the plot
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(left, t.pos);
    ctx.lineTo(right, t.pos);
    ctx.stroke();
    ctx.globalAlpha = 0.85;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(t.label, left - 8, t.pos);
  }
  ctx.textBaseline = "alphabetic";

  if (opts.xTicks?.length) {
    // title above the axis at the right end — below it sits the caption overlay
    ctx.textAlign = "right";
    ctx.fillText(xLabel, right - 4, bottom - 8);
  } else {
    ctx.textAlign = "center";
    ctx.fillText(xLabel, (left + right) / 2, bottom + 10);
  }
  if (opts.yTicks?.length) {
    // horizontal title above the axis — a rotated one collides with wide
    // value labels like 3.81×10^15
    ctx.textAlign = "left";
    ctx.fillText(yLabel, left, top - 10);
  } else {
    ctx.save();
    ctx.translate(left - 14, (top + bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}
