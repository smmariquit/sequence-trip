// src/visualizations/CollatzTree.tsx

import React, { useMemo } from "react";
import {
  Canvas,
  Path as SkiaPath,
  Skia,
} from "@shopify/react-native-skia";
import { hslToHex } from "../theme";
import { useBuildAnimation, useItemFrac } from "../playback/useBuildAnimation";
import { buildCollatzBranches, fitCollatz } from "./collatzLayout";

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

function buildBranches(width: number, height: number, n: number, preview: boolean): Branch[] {
  const raw = buildCollatzBranches(n);
  const { scale, dx, dy } = fitCollatz(raw, width, height, preview);

  return raw.map((b) => {
    const path = Skia.Path.Make();
    b.pts.forEach((p, i) => {
      const x = dx + p.x * scale;
      const y = dy + p.y * scale;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    return { path, hue: b.hue };
  });
}

export function CollatzTreePreview({ width, height }: { width: number; height: number }) {
  const branches = useMemo(
    () => buildBranches(width, height, 14, true),
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
    () => buildBranches(width, height, count, false),
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
