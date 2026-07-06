// src/components/ui/CenteredState.tsx

import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useThemeColors } from "../../theme";
import BodyText from "./BodyText";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  loading?: boolean;
  message?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function CenteredState({ loading, message, children, style }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, style]}>
      {loading ? <LoadingSpinner style={styles.inlineSpinner} /> : null}
      {message ? <BodyText variant="error">{message}</BodyText> : null}
      {children}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  inlineSpinner: {
    marginVertical: 0,
  },
});
