// src/components/ErrorBoundary.tsx

import React, { Component } from "react";
import { colors } from "../theme";
import { BodyText, CenteredState } from "./ui";

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
        <CenteredState style={styles.container}>
          <BodyText variant="body" style={styles.label}>
            {this.props.fallbackText ?? "Visualization error"}
          </BodyText>
          <BodyText variant="caption" style={styles.error}>
            {this.state.error}
          </BodyText>
        </CenteredState>
      );
    }
    return this.props.children;
  }
}

const styles = {
  container: {
    padding: 16,
    backgroundColor: colors.bg,
  },
  label: {
    marginBottom: 8,
    textAlign: "center" as const,
  },
  error: {
    color: colors.accentAlt,
    textAlign: "center" as const,
    marginBottom: 0,
  },
};
