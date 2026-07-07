// src/visualizations/RecamanArcs.tsx

import React, { useMemo } from "react";
import {
  Canvas,
  Path as SkiaPath,
  Skia,
  Circle,
  Line,
} from "@shopify/react-native-skia";
import { hslToHex, useThemeColors } from "../theme";
import { useBuildAnimation, useItemFrac } from "../playback/useBuildAnimation";
import { recaman } from "../sequences/generators";
import { layoutRecaman } from "./recamanLayout";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

type Arc = { path: ReturnType<typeof Skia.Path.Make>; hue: number };

// Semicircle between consecutive terms, centered on the number line (midY).
// Above arcs sweep left→top→right, below arcs right→bottom→left — both start
// where the previous arc ended, so trim-from-start animates the walk.
export function makeArcPath(
  left: number,
  right: number,
  scaleX: number,
  pad: number,
  midY: number,
  above: boolean
) {
  const radius = ((right - left) * scaleX) / 2;
  const cx = left * scaleX + pad + radius;
  const path = Skia.Path.Make();
  path.addArc(
    {
      x: cx - radius,
      y: midY - radius,
      width: radius * 2,
      height: radius * 2,
    },
    above ? 180 : 0,
    180
  );
  return path;
}

function buildArcs(
  seq: number[],
  width: number,
  height: number,
  preview: boolean
): { arcs: Arc[]; head: { x: number; y: number } | null } {
  const { x0: pad, midY, scaleX } = layoutRecaman(seq, width, height, preview);

  const arcs = seq.slice(0, -1).map((val, i) => {
    const next = seq[i + 1];
    const left = Math.min(val, next);
    const right = Math.max(val, next);
    const path = makeArcPath(left, right, scaleX, pad, midY, i % 2 === 0);
    return { path, hue: (i * 360) / seq.length };
  });

  const term = seq[seq.length - 1];
  const head = { x: term * scaleX + pad, y: midY };
  return { arcs, head };
}

export function RecamanArcsPreview({ width, height }: { width: number; height: number }) {
  const seq = useMemo(() => recaman(20), []);
  const { arcs, head } = useMemo(
    () => buildArcs(seq, width, height, true),
    [seq, width, height]
  );

  return (
    <Canvas style={{ width, height }}>
      {arcs.map((arc, i) => (
        <SkiaPath
          key={i}
          path={arc.path}
          style="stroke"
          strokeWidth={1.2}
          color={hslToHex(arc.hue, 90, 55)}
        />
      ))}
      {head && (
        <Circle cx={head.x} cy={head.y} r={3} color={hslToHex(0, 100, 70)} />
      )}
    </Canvas>
  );
}

export function RecamanArcsFull({ width, height, count = 64 }: Omit<Props, "preview">) {
  const colors = useThemeColors();
  const n = count;
  const { progressSV, step: visible } = useBuildAnimation(Math.max(n - 1, 0), false);
  const growEnd = useItemFrac(progressSV, visible);

  const seq = useMemo(() => recaman(n), [n]);

  const layout = useMemo(
    () => layoutRecaman(seq, width, height, false),
    [seq, width, height]
  );

  // completed arcs + the in-progress one (trimmed by fractional progress)
  const arcs = useMemo(() => {
    const { x0: pad, midY, scaleX } = layout;
    return seq.slice(0, -1).slice(0, visible + 1).map((val, i) => {
      const next = seq[i + 1];
      const left = Math.min(val, next);
      const right = Math.max(val, next);
      const path = makeArcPath(left, right, scaleX, pad, midY, i % 2 === 0);
      return { path, hue: (i * 360) / seq.length };
    });
  }, [seq, layout, visible]);

  const head = useMemo(() => {
    if (visible <= 0) return null;
    const term = seq[Math.min(visible, seq.length - 1)];
    return { x: term * layout.scaleX + layout.x0, y: layout.midY };
  }, [seq, layout, visible]);

  const tickLines = useMemo(() => {
    const { x0, axisY, span } = layout;
    const ticks = 5;
    return Array.from({ length: ticks + 1 }, (_, i) => ({
      x: x0 + (span * i) / ticks,
      y: axisY,
    }));
  }, [layout]);

  return (
    <Canvas style={{ width, height }}>
      {tickLines.map((t, i) => (
        <Line
          key={`tick-${i}`}
          p1={{ x: t.x, y: t.y - 5 }}
          p2={{ x: t.x, y: t.y + 5 }}
          color={colors.textMuted}
          opacity={0.6}
          strokeWidth={1}
        />
      ))}
      <Line
        p1={{ x: layout.x0, y: layout.axisY }}
        p2={{ x: layout.x0 + layout.span, y: layout.axisY }}
        color={colors.textMuted}
        opacity={0.6}
        strokeWidth={1}
      />
      {arcs.map((arc, i) => (
        <SkiaPath
          key={i}
          path={arc.path}
          style="stroke"
          strokeWidth={2.5}
          color={hslToHex(arc.hue, 90, 55)}
          start={0}
          end={i < visible ? 1 : growEnd}
        />
      ))}
      {head && (
        <>
          <Line
            p1={{ x: head.x, y: head.y }}
            p2={{ x: head.x, y: layout.axisY }}
            color="rgba(255, 120, 120, 0.55)"
            strokeWidth={1}
          />
          <Circle cx={head.x} cy={head.y} r={6} color={hslToHex(0, 100, 70)} />
        </>
      )}
    </Canvas>
  );
}

export default function RecamanArcs({ width, height, count, preview }: Props) {
  if (preview !== false) {
    return <RecamanArcsPreview width={width} height={height} />;
  }
  return <RecamanArcsFull width={width} height={height} count={count} />;
}
