// src/components/ErrorBoundary.tsx

import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

interface Props {
  children: React.ReactNode;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  error: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.label}>{this.props.fallbackText ?? "Visualization error"}</Text>
          <Text style={styles.error}>{this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.bg,
  },
  label: {
    color: colors.textDim,
    fontSize: 14,
    marginBottom: 8,
  },
  error: {
    color: colors.accentAlt,
    fontSize: 12,
    textAlign: "center",
  },
});
