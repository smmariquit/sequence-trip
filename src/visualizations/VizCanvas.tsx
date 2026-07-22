// src/visualizations/VizCanvas.tsx
//
// Drop-in replacement for the bare Skia <Canvas> in every native viz: applies
// the committed zoom/pan as a Group transform so zoomed content redraws at
// full resolution instead of scaling a raster.

import React from "react";
import { Canvas, Group } from "@shopify/react-native-skia";
import { useVizTransform } from "./vizTransform";

interface Props {
  width: number;
  height: number;
  children: React.ReactNode;
}

export default function VizCanvas({ width, height, children }: Props) {
  const { scale, tx, ty } = useVizTransform();

  if (scale === 1 && tx === 0 && ty === 0) {
    return <Canvas style={{ width, height }}>{children}</Canvas>;
  }

  // scale about the canvas center, then pan
  return (
    <Canvas style={{ width, height }}>
      <Group
        transform={[
          { translateX: tx + (width / 2) * (1 - scale) },
          { translateY: ty + (height / 2) * (1 - scale) },
          { scale },
        ]}
      >
        {children}
      </Group>
    </Canvas>
  );
}
