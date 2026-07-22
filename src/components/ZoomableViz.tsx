// src/components/ZoomableViz.tsx
//
// Zoom/pan for the viz area. Gestures move the rendered surface transiently
// (raster, may blur mid-pinch); on release the accumulated transform is
// committed into VizTransformContext and the view snaps back to identity, so
// the viz redraws its vectors at full resolution inside the canvas.

import React from "react";
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useThemeColors } from "../theme";
import { radii, spacing } from "../theme/tokens";
import AppIcon from "./ui/AppIcon";
import PlainText from "./PlainText";
import {
  IDENTITY_VIZ_TRANSFORM,
  VizTransformContext,
  type VizTransform,
} from "../visualizations/vizTransform";
import {
  MAX_VIZ_ZOOM,
  MIN_VIZ_ZOOM,
  clampVizZoom,
  stepVizZoom,
  vizPanLimit,
} from "./vizZoom";

interface Props {
  width: number;
  height: number;
  children: React.ReactNode;
}

interface WebWheelEvent {
  deltaY?: number;
  nativeEvent?: { deltaY?: number };
  preventDefault?: () => void;
}

function clampPan(t: VizTransform, width: number, height: number): VizTransform {
  const limitX = vizPanLimit(width, t.scale);
  const limitY = vizPanLimit(height, t.scale);
  return {
    scale: t.scale,
    tx: Math.min(limitX, Math.max(-limitX, t.tx)),
    ty: Math.min(limitY, Math.max(-limitY, t.ty)),
  };
}

export default function ZoomableViz({ width, height, children }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { width: windowWidth } = useWindowDimensions();
  const narrow = windowWidth < 600;

  // committed transform: rendered inside the canvas, crisp
  const [committed, setCommitted] = React.useState<VizTransform>(IDENTITY_VIZ_TRANSFORM);
  const committedRef = React.useRef(committed);
  committedRef.current = committed;

  // transient gesture transform: view layer, reset on commit
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const gestureScale = useSharedValue(1);
  const gestureX = useSharedValue(0);
  const gestureY = useSharedValue(0);
  const committedScaleSV = useSharedValue(1);
  const committedTxSV = useSharedValue(0);
  const committedTySV = useSharedValue(0);

  React.useEffect(() => {
    committedScaleSV.value = committed.scale;
    committedTxSV.value = committed.tx;
    committedTySV.value = committed.ty;
  }, [committed, committedScaleSV, committedTxSV, committedTySV]);

  const commitTransform = React.useCallback(
    (next: VizTransform) => {
      const clamped = clampPan(
        { ...next, scale: clampVizZoom(next.scale) },
        width,
        height
      );
      setCommitted(
        clamped.scale === 1 ? IDENTITY_VIZ_TRANSFORM : clamped
      );
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    },
    [height, scale, translateX, translateY, width]
  );

  // fold the transient view transform into the committed one
  const commitGesture = React.useCallback(() => {
    const prev = committedRef.current;
    const vs = scale.value;
    const vtx = translateX.value;
    const vty = translateY.value;
    if (vs === 1 && vtx === 0 && vty === 0) return;
    const nextScale = clampVizZoom(vs * prev.scale);
    const f = nextScale / prev.scale;
    commitTransform({
      scale: nextScale,
      tx: f * prev.tx + vtx,
      ty: f * prev.ty + vty,
    });
  }, [commitTransform, scale, translateX, translateY]);

  const applyZoom = React.useCallback(
    (value: number) => {
      const prev = committedRef.current;
      const nextScale = clampVizZoom(value);
      const f = nextScale / prev.scale;
      commitTransform({ scale: nextScale, tx: prev.tx * f, ty: prev.ty * f });
    },
    [commitTransform]
  );

  const resetZoom = React.useCallback(() => {
    commitTransform(IDENTITY_VIZ_TRANSFORM);
  }, [commitTransform]);

  const gesture = React.useMemo(() => {
    const pinch = Gesture.Pinch()
      .onBegin(() => {
        gestureScale.value = scale.value;
      })
      .onUpdate((event) => {
        const cs = committedScaleSV.value;
        scale.value = Math.min(
          MAX_VIZ_ZOOM / cs,
          Math.max(MIN_VIZ_ZOOM / cs, gestureScale.value * event.scale)
        );
      })
      .onFinalize(() => {
        runOnJS(commitGesture)();
      });

    const pan = Gesture.Pan()
      .onBegin(() => {
        gestureX.value = translateX.value;
        gestureY.value = translateY.value;
      })
      .onUpdate((event) => {
        const total = committedScaleSV.value * scale.value;
        if (total <= MIN_VIZ_ZOOM) return;
        const limitX = (width * (total - 1)) / 2;
        const limitY = (height * (total - 1)) / 2;
        const baseX = scale.value * committedTxSV.value;
        const baseY = scale.value * committedTySV.value;
        translateX.value = Math.min(
          limitX - baseX,
          Math.max(-limitX - baseX, gestureX.value + event.translationX)
        );
        translateY.value = Math.min(
          limitY - baseY,
          Math.max(-limitY - baseY, gestureY.value + event.translationY)
        );
      })
      .onFinalize(() => {
        runOnJS(commitGesture)();
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        runOnJS(resetZoom)();
      });

    return Gesture.Simultaneous(pinch, pan, doubleTap);
  }, [
    commitGesture,
    committedScaleSV,
    committedTxSV,
    committedTySV,
    gestureScale,
    gestureX,
    gestureY,
    height,
    resetZoom,
    scale,
    translateX,
    translateY,
    width,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleWheel = React.useCallback(
    (event: WebWheelEvent) => {
      const delta = event?.nativeEvent?.deltaY ?? event?.deltaY ?? 0;
      if (!delta) return;
      event.preventDefault?.();
      applyZoom(committedRef.current.scale * (delta < 0 ? 1.15 : 1 / 1.15));
    },
    [applyZoom]
  );

  const webWheelProps = Platform.OS === "web" ? { onWheel: handleWheel } : {};
  const zoom = committed.scale;

  return (
    <View style={styles.container} {...webWheelProps}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.surface, { width, height }, animatedStyle]}
          testID="viz-zoom-surface"
        >
          <VizTransformContext.Provider value={committed}>
            {children}
          </VizTransformContext.Provider>
        </Animated.View>
      </GestureDetector>

      <View
        style={[styles.controls, narrow ? styles.controlsNarrow : styles.controlsWide]}
        testID="viz-zoom-controls"
      >
        <Pressable
          onPress={() => applyZoom(stepVizZoom(committedRef.current.scale, -1))}
          disabled={zoom <= MIN_VIZ_ZOOM}
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          testID="viz-zoom-out"
          style={({ pressed }) => [
            styles.control,
            zoom <= MIN_VIZ_ZOOM && styles.controlDisabled,
            pressed && styles.controlPressed,
          ]}
        >
          <AppIcon name="remove" size={18} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={resetZoom}
          accessibilityRole="button"
          accessibilityLabel="Reset zoom to 100 percent"
          testID="viz-zoom-level"
          style={({ pressed }) => [styles.level, pressed && styles.controlPressed]}
        >
          <PlainText style={styles.levelText}>{`${Math.round(zoom * 100)}%`}</PlainText>
        </Pressable>
        <Pressable
          onPress={() => applyZoom(stepVizZoom(committedRef.current.scale, 1))}
          disabled={zoom >= MAX_VIZ_ZOOM}
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          testID="viz-zoom-in"
          style={({ pressed }) => [
            styles.control,
            zoom >= MAX_VIZ_ZOOM && styles.controlDisabled,
            pressed && styles.controlPressed,
          ]}
        >
          <AppIcon name="add" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
    },
    surface: {
      overflow: "hidden",
    },
    controls: {
      position: "absolute",
      top: spacing.sm,
      left: spacing.sm,
      zIndex: 2,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.pill,
      backgroundColor: colors.bgElevated,
      padding: 3,
      gap: 2,
    },
    controlsNarrow: {
      flexDirection: "column-reverse",
    },
    controlsWide: {
      flexDirection: "row",
    },
    control: {
      width: 40,
      height: 40,
      borderRadius: radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    level: {
      minWidth: 44,
      height: 40,
      borderRadius: radii.pill,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 5,
    },
    levelText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
    controlDisabled: {
      opacity: 0.35,
    },
    controlPressed: {
      opacity: 0.72,
    },
  });
