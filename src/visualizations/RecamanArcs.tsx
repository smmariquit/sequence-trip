// src/visualizations/RecamanArcs.tsx

import React, { useMemo } from "react";
import {
  Canvas,
  Path as SkiaPath,
  Skia,
  Circle,
  Line,
} from "@shopify/react-native-skia";
import { hslToHex } from "../theme";
import { useBuildAnimation } from "../playback/useBuildAnimation";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

type Arc = { path: ReturnType<typeof Skia.Path.Make>; hue: number };

function buildRecamanSeq(n: number): number[] {
  const s = [0];
  const seen = new Set([0]);
  for (let i = 1; i < n; i++) {
    const back = s[i - 1] - i;
    if (back > 0 && !seen.has(back)) s.push(back);
    else s.push(s[i - 1] + i);
    seen.add(s[i]);
  }
  return s;
}

function buildArcs(
  seq: number[],
  width: number,
  height: number,
  preview: boolean
): { arcs: Arc[]; head: { x: number; y: number } | null } {
  const pad = preview ? 8 : 24;
  const axisY = height - (preview ? 14 : 36);
  const midY = axisY - (preview ? 28 : 72);
  const maxVal = Math.max(...seq, 1);
  const span = width - pad * 2;
  const scaleX = span / maxVal;

  const arcs = seq.slice(0, -1).map((val, i) => {
    const next = seq[i + 1];
    const left = Math.min(val, next);
    const right = Math.max(val, next);
    const radius = ((right - left) * scaleX) / 2;
    const cx = left * scaleX + pad + radius;
    const above = i % 2 === 0;
    const path = Skia.Path.Make();
    path.addArc(
      {
        x: cx - radius,
        y: above ? midY - radius : midY,
        width: radius * 2,
        height: radius * 2,
      },
      above ? 180 : 0,
      180
    );
    return { path, hue: (i * 360) / seq.length };
  });

  const term = seq[seq.length - 1];
  const head = { x: term * scaleX + pad, y: midY };
  return { arcs, head };
}

export function RecamanArcsPreview({ width, height }: { width: number; height: number }) {
  const seq = useMemo(() => buildRecamanSeq(20), []);
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
  const n = count;
  const { step: visible } = useBuildAnimation(Math.max(n - 1, 0), false);

  const seq = useMemo(() => buildRecamanSeq(n), [n]);

  const layout = useMemo(() => {
    const pad = 24;
    const axisY = height - 36;
    const midY = axisY - 72;
    const maxVal = Math.max(...seq.slice(0, Math.max(visible, 1) + 1), 1);
    const span = width - pad * 2;
    const scaleX = span / maxVal;
    return { pad, axisY, midY, span, scaleX };
  }, [seq, width, height, visible]);

  const arcs = useMemo(() => {
    const { pad, midY, scaleX } = layout;
    return seq.slice(0, -1).slice(0, visible).map((val, i) => {
      const next = seq[i + 1];
      const left = Math.min(val, next);
      const right = Math.max(val, next);
      const radius = ((right - left) * scaleX) / 2;
      const cx = left * scaleX + pad + radius;
      const above = i % 2 === 0;
      const path = Skia.Path.Make();
      path.addArc(
        {
          x: cx - radius,
          y: above ? midY - radius : midY,
          width: radius * 2,
          height: radius * 2,
        },
        above ? 180 : 0,
        180
      );
      return { path, hue: (i * 360) / seq.length };
    });
  }, [seq, layout, visible]);

  const head = useMemo(() => {
    if (visible <= 0) return null;
    const term = seq[Math.min(visible, seq.length - 1)];
    return { x: term * layout.scaleX + layout.pad, y: layout.midY };
  }, [seq, layout, visible]);

  const tickLines = useMemo(() => {
    const { pad, axisY, span } = layout;
    const ticks = 5;
    return Array.from({ length: ticks + 1 }, (_, i) => ({
      x: pad + (span * i) / ticks,
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
          color="rgba(240, 236, 255, 0.35)"
          strokeWidth={1}
        />
      ))}
      <Line
        p1={{ x: layout.pad, y: layout.axisY }}
        p2={{ x: layout.pad + layout.span, y: layout.axisY }}
        color="rgba(240, 236, 255, 0.35)"
        strokeWidth={1}
      />
      {arcs.map((arc, i) => (
        <SkiaPath
          key={i}
          path={arc.path}
          style="stroke"
          strokeWidth={2.5}
          color={hslToHex(arc.hue, 90, 55)}
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
