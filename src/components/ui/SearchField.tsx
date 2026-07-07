// src/components/ui/SearchField.tsx

import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { useThemeColors } from "../../theme";
import { radii, spacing, touch } from "../../theme/tokens";
import AppIcon from "./AppIcon";

interface Props extends Pick<TextInputProps, "value" | "onChangeText" | "placeholder" | "testID"> {}

export default function SearchField({
  value,
  onChangeText,
  placeholder,
  testID,
}: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <AppIcon name="search" size={touch.iconSizeSm} color={colors.textMuted} />
      <TextInput
        testID={testID}
        accessibilityLabel="Search sequences by name, A-number, or terms"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    minHeight: touch.minHeight + 4,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    padding: 0,
    margin: 0,
  },
});
