// src/visualizations/CollatzTree.tsx

import React, { useMemo } from "react";
import {
  Canvas,
  Path as SkiaPath,
  Skia,
} from "@shopify/react-native-skia";
import { collatzSequence } from "../sequences/generators";
import { hslToHex } from "../theme";
import { useBuildAnimation, useItemFrac } from "../playback/useBuildAnimation";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

type Branch = {
  path: ReturnType<typeof Skia.Path.Make>;
  hue: number;
};

function buildBranches(width: number, height: number, n: number, stepLen: number): Branch[] {
  const cx = width / 2;
  const startY = height - 30;
  const evenAngle = Math.PI / 12;
  const oddAngle = -Math.PI / 7;

  return Array.from({ length: n }, (_, i) => {
    const seq = collatzSequence(i + 2);
    const path = Skia.Path.Make();

    let x = cx;
    let y = startY;
    let angle = -Math.PI / 2;
    path.moveTo(x, y);

    for (let j = 0; j < seq.length - 1 && j < 120; j++) {
      angle += seq[j] % 2 === 0 ? evenAngle : oddAngle;
      x += Math.cos(angle) * stepLen;
      y += Math.sin(angle) * stepLen;
      path.lineTo(x, y);
    }

    return { path, hue: (i * 360) / n };
  });
}

export function CollatzTreePreview({ width, height }: { width: number; height: number }) {
  const branches = useMemo(
    () => buildBranches(width, height, 14, 4),
    [width, height]
  );

  return (
    <Canvas style={{ width, height }}>
      {branches.map((branch, i) => (
        <SkiaPath
          key={i}
          path={branch.path}
          style="stroke"
          strokeWidth={1}
          color={hslToHex(branch.hue, 85, 55)}
          strokeCap="round"
          strokeJoin="round"
        />
      ))}
    </Canvas>
  );
}

export function CollatzTreeFull({ width, height, count = 40 }: Omit<Props, "preview">) {
  const { progressSV, step: visible } = useBuildAnimation(count, false);
  const growEnd = useItemFrac(progressSV, visible);

  const branches = useMemo(
    () => buildBranches(width, height, count, 7),
    [count, width, height]
  );

  return (
    <Canvas style={{ width, height }}>
      {branches.slice(0, visible + 1).map((branch, i) => (
        <SkiaPath
          key={i}
          path={branch.path}
          style="stroke"
          strokeWidth={1.8}
          color={hslToHex(branch.hue, 85, 55)}
          strokeCap="round"
          strokeJoin="round"
          start={0}
          end={i < visible ? 1 : growEnd}
        />
      ))}
    </Canvas>
  );
}

export default function CollatzTree({ width, height, count, preview }: Props) {
  if (preview !== false) {
    return <CollatzTreePreview width={width} height={height} />;
  }
  return <CollatzTreeFull width={width} height={height} count={count} />;
}
