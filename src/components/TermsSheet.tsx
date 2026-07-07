// src/components/TermsSheet.tsx
//
// Plain list of the sequence's terms: n and a(n), no OEIS entry required.

import React from "react";
import { Modal, View, Pressable, Text, ScrollView, StyleSheet } from "react-native";
import { useThemeColors } from "../theme";
import { spacing, radii } from "../theme/tokens";
import PlainText from "./PlainText";
import AppIcon from "./ui/AppIcon";

export default function TermsSheet({
  anum,
  terms,
  offset = 0,
  visible,
  onClose,
}: {
  anum: string;
  terms: string[];
  /** Index of the first term (OEIS offset), defaults to 0. */
  offset?: number;
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close term list">
        <Pressable style={styles.sheet} onPress={() => {}} testID="terms-sheet">
          <View style={styles.header}>
            <PlainText style={styles.heading}>{`${anum} terms`}</PlainText>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close term list"
              testID="terms-sheet-close"
            >
              <AppIcon name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView style={styles.scroll}>
            {terms.map((t, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.index}>{`a(${i + offset})`}</Text>
                <Text style={styles.value} selectable>
                  {t}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    maxWidth: 520,
    maxHeight: "80%",
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  index: {
    color: colors.textMuted,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    minWidth: 72,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    flex: 1,
  },
});
