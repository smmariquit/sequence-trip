// src/visualizations/PascalFractal.tsx

import React, { useMemo } from "react";
import {
  Canvas,
  Group,
  Rect,
} from "@shopify/react-native-skia";
import { hslToHex } from "../theme";
import { useBuildAnimation, useItemFrac } from "../playback/useBuildAnimation";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

type Cell = {
  x: number;
  y: number;
  w: number;
  h: number;
  row: number;
  col: number;
};

function computePascalMod(rows: number, mod: number): number[][] {
  const tri: number[][] = [[1]];
  for (let r = 1; r < rows; r++) {
    const prev = tri[r - 1];
    const row = [1];
    for (let k = 1; k < r; k++) {
      row.push((prev[k - 1] + prev[k]) % mod);
    }
    row.push(1);
    tri.push(row);
  }
  return tri;
}

function buildCells(rows: number, width: number, height: number): Cell[] {
  const tri = computePascalMod(rows, 2);
  const cellH = height / rows;
  const result: Cell[] = [];

  for (let r = 0; r < rows; r++) {
    const cellW = width / (r + 1);
    const offsetX = (width - cellW * tri[r].length) / 2;
    for (let c = 0; c < tri[r].length; c++) {
      if (tri[r][c] !== 0) {
        result.push({
          x: offsetX + c * cellW,
          y: r * cellH,
          w: cellW,
          h: cellH,
          row: r,
          col: c,
        });
      }
    }
  }
  return result;
}

export function PascalFractalPreview({ width, height }: { width: number; height: number }) {
  const cells = useMemo(() => buildCells(32, width, height), [width, height]);

  return (
    <Canvas style={{ width, height }}>
      {cells.map((cell, i) => (
        <Rect
          key={i}
          x={cell.x}
          y={cell.y}
          width={cell.w}
          height={cell.h}
          color={hslToHex((cell.row * 3.5 + cell.col * 7) % 360, 90, 58)}
        />
      ))}
    </Canvas>
  );
}

export function PascalFractalFull({ width, height, count = 128 }: Omit<Props, "preview">) {
  const { progressSV, step: visible } = useBuildAnimation(count, false);
  const cells = useMemo(() => buildCells(count, width, height), [count, width, height]);
  const rowFade = useItemFrac(progressSV, visible);

  const cellRect = (cell: Cell, i: number) => (
    <Rect
      key={i}
      x={cell.x}
      y={cell.y}
      width={cell.w}
      height={cell.h}
      color={hslToHex((cell.row * 3.5 + cell.col * 7) % 360, 90, 58)}
    />
  );

  return (
    <Canvas style={{ width, height }}>
      {cells.filter((cell) => cell.row < visible).map(cellRect)}
      <Group opacity={rowFade}>
        {cells.filter((cell) => cell.row === visible).map(cellRect)}
      </Group>
    </Canvas>
  );
}

export default function PascalFractal({ width, height, count, preview }: Props) {
  if (preview !== false) {
    return <PascalFractalPreview width={width} height={height} />;
  }
  return <PascalFractalFull width={width} height={height} count={count} />;
}
