// src/components/ui/BulletRow.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";
import BodyText from "./BodyText";

interface Props {
  children: string;
}

export default function BulletRow({ children }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Text style={styles.dot}>·</Text>
      <BodyText variant="body" style={styles.text}>
        {children}
      </BodyText>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingRight: 4,
  },
  dot: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 21,
    width: 12,
  },
  text: {
    flex: 1,
    marginBottom: 0,
  },
});
