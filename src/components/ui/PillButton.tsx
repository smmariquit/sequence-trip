// src/components/ui/PillButton.tsx

import React from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useThemeColors } from "../../theme";
import { radii, touch, typography } from "../../theme/tokens";
import AppIcon, { type AppIconName } from "./AppIcon";

export type PillVariant =
  | "back"
  | "action"
  | "primary"
  | "icon"
  | "info"
  | "speed";

interface Props {
  variant: PillVariant;
  onPress: () => void;
  children?: React.ReactNode;
  label?: string;
  icon?: AppIconName;
  iconPosition?: "left" | "right" | "only";
  testID?: string;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export default function PillButton({
  variant,
  onPress,
  children,
  label,
  icon,
  iconPosition = "left",
  testID,
  style,
  flex,
  accessibilityLabel,
  disabled = false,
}: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const textContent =
    typeof children === "string" ? children : label ?? null;
  const showIconOnly = iconPosition === "only" || (!textContent && !!icon);
  const a11y =
    accessibilityLabel ??
    (typeof textContent === "string" ? textContent : undefined);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        styles.variantStyles[variant],
        flex && styles.flex,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        variant === "primary" && pressed && !disabled && styles.primaryPressed,
        style,
      ]}
    >
      <View style={[styles.inner, showIconOnly && styles.innerIconOnly]}>
        {icon && iconPosition !== "right" && !showIconOnly ? (
          <AppIcon name={icon} size={touch.iconSizeSm} color={styles.iconColors[variant]} />
        ) : null}
        {icon && showIconOnly ? (
          <AppIcon name={icon} size={touch.iconSize} color={styles.iconColors[variant]} />
        ) : null}
        {textContent ? (
          typeof children === "string" || label ? (
            <Text style={styles.labelStyles[variant]}>{textContent}</Text>
          ) : (
            children
          )
        ) : (
          !showIconOnly ? children : null
        )}
        {icon && iconPosition === "right" && textContent ? (
          <AppIcon name={icon} size={touch.iconSizeSm} color={styles.iconColors[variant]} />
        ) : null}
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: any) => ({
  variantStyles: StyleSheet.create({
    back: {
      paddingHorizontal: 12,
      minHeight: touch.minHeight,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    action: {
      paddingHorizontal: 16,
      minHeight: touch.minHeight,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primary: {
      paddingHorizontal: 16,
      minHeight: touch.minHeight,
      borderRadius: radii.md,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    icon: {
      paddingHorizontal: 12,
      minWidth: touch.minHeight,
      minHeight: touch.minHeight,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    info: {
      paddingHorizontal: 14,
      minHeight: 36,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
    },
    speed: {
      paddingHorizontal: 14,
      minHeight: 36,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      backgroundColor: colors.primaryDim,
    },
  }),
  labelStyles: StyleSheet.create({
    back: {
      color: colors.text,
      ...typography.labelSm,
    },
    action: {
      color: colors.interactive,
      ...typography.label,
    },
    primary: {
      color: colors.text,
      ...typography.label,
      fontWeight: "700",
    },
    icon: {
      color: colors.text,
      ...typography.labelSm,
    },
    info: {
      color: colors.textDim,
      ...typography.labelSm,
    },
    speed: {
      color: colors.primary,
      ...typography.label,
      fontVariant: ["tabular-nums"],
    },
  }),
  iconColors: {
    back: colors.text,
    action: colors.interactive,
    primary: colors.text,
    icon: colors.text,
    info: colors.textDim,
    speed: colors.primary,
  } as Record<PillVariant, string>,
  ...StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      backgroundColor: colors.surfacePressed,
      opacity: 0.92,
    },
    primaryPressed: {
      backgroundColor: colors.primary,
      opacity: 0.88,
    },
    disabled: {
      opacity: 0.45,
    },
    flex: {
      flex: 1,
    },
    inner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    innerIconOnly: {
      gap: 0,
    },
  }),
});
