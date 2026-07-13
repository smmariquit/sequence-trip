import React from "react";
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "../theme";
import { radii, spacing } from "../theme/tokens";
import AppIcon from "./ui/AppIcon";
import PlainText from "./PlainText";
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

export default function ZoomableViz({ width, height, children }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { width: windowWidth } = useWindowDimensions();
  const narrow = windowWidth < 600;
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const gestureScale = useSharedValue(1);
  const gestureX = useSharedValue(0);
  const gestureY = useSharedValue(0);
  const zoomRef = React.useRef(1);
  const [zoom, setZoom] = React.useState(1);

  const reportZoom = React.useCallback((value: number) => {
    zoomRef.current = value;
    setZoom(value);
  }, []);

  const applyZoom = React.useCallback(
    (value: number) => {
      const next = clampVizZoom(value);
      const limitX = vizPanLimit(width, next);
      const limitY = vizPanLimit(height, next);
      scale.value = withTiming(next, { duration: 180 });
      translateX.value = withTiming(
        Math.min(limitX, Math.max(-limitX, translateX.value)),
        { duration: 180 }
      );
      translateY.value = withTiming(
        Math.min(limitY, Math.max(-limitY, translateY.value)),
        { duration: 180 }
      );
      reportZoom(next);
    },
    [height, reportZoom, scale, translateX, translateY, width]
  );

  const resetZoom = React.useCallback(() => {
    scale.value = withTiming(1, { duration: 180 });
    translateX.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(0, { duration: 180 });
    reportZoom(1);
  }, [reportZoom, scale, translateX, translateY]);

  const gesture = React.useMemo(() => {
    const pinch = Gesture.Pinch()
      .onBegin(() => {
        gestureScale.value = scale.value;
      })
      .onUpdate((event) => {
        scale.value = Math.min(
          MAX_VIZ_ZOOM,
          Math.max(MIN_VIZ_ZOOM, gestureScale.value * event.scale)
        );
      })
      .onFinalize(() => {
        const next = Math.min(MAX_VIZ_ZOOM, Math.max(MIN_VIZ_ZOOM, scale.value));
        scale.value = withTiming(next, { duration: 120 });
        if (next === MIN_VIZ_ZOOM) {
          translateX.value = withTiming(0, { duration: 120 });
          translateY.value = withTiming(0, { duration: 120 });
        }
        runOnJS(reportZoom)(next);
      });

    const pan = Gesture.Pan()
      .onBegin(() => {
        gestureX.value = translateX.value;
        gestureY.value = translateY.value;
      })
      .onUpdate((event) => {
        if (scale.value <= MIN_VIZ_ZOOM) return;
        const limitX = (width * (scale.value - 1)) / 2;
        const limitY = (height * (scale.value - 1)) / 2;
        translateX.value = Math.min(
          limitX,
          Math.max(-limitX, gestureX.value + event.translationX)
        );
        translateY.value = Math.min(
          limitY,
          Math.max(-limitY, gestureY.value + event.translationY)
        );
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        scale.value = withTiming(1, { duration: 180 });
        translateX.value = withTiming(0, { duration: 180 });
        translateY.value = withTiming(0, { duration: 180 });
        runOnJS(reportZoom)(1);
      });

    return Gesture.Simultaneous(pinch, pan, doubleTap);
  }, [gestureScale, gestureX, gestureY, height, reportZoom, scale, translateX, translateY, width]);

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
      applyZoom(zoomRef.current * (delta < 0 ? 1.15 : 1 / 1.15));
    },
    [applyZoom]
  );

  const webWheelProps = Platform.OS === "web" ? { onWheel: handleWheel } : {};

  return (
    <View style={styles.container} {...webWheelProps}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.surface, { width, height }, animatedStyle]}
          testID="viz-zoom-surface"
        >
          {children}
        </Animated.View>
      </GestureDetector>

      <View
        style={[styles.controls, narrow ? styles.controlsNarrow : styles.controlsWide]}
        testID="viz-zoom-controls"
      >
        <Pressable
          onPress={() => applyZoom(stepVizZoom(zoomRef.current, -1))}
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
          onPress={() => applyZoom(stepVizZoom(zoomRef.current, 1))}
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
      width: 36,
      height: 36,
      borderRadius: radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    level: {
      minWidth: 42,
      height: 36,
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
