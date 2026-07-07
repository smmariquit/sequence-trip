// src/components/WebPageShell.tsx
//
// Centers content on wide desktop browsers instead of a skinny mobile column.

import React from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { useThemeColors } from "../theme";
import { MAX_PAGE_WIDTH } from "../theme/layout";

const MAX_CONTENT = MAX_PAGE_WIDTH;

// output:"single" ignores app/+html.tsx, so web-only DOM extras (skip link,
// katex style tweaks) are injected here at runtime instead.
const WEB_EXTRAS_CSS = `
.skip-link { position: absolute; left: -9999px; z-index: 100; background: #F0ECFF; color: #07060E; padding: 8px 16px; border-radius: 8px; font-family: system-ui, sans-serif; }
.skip-link:focus { left: 8px; top: 8px; }
.katex { color: inherit; font-size: 1em; }
.katex-display { margin: 0.4em 0; }
.math-text .katex { white-space: normal; }
`;

function WebExtras() {
  React.useEffect(() => {
    if (document.getElementById("web-extras")) return;
    const style = document.createElement("style");
    style.id = "web-extras";
    style.textContent = WEB_EXTRAS_CSS;
    document.head.appendChild(style);
    const a = document.createElement("a");
    a.href = "#main";
    a.className = "skip-link";
    a.textContent = "Skip to main content";
    document.body.prepend(a);
  }, []);
  return null;
}

export default function WebPageShell({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const { width } = useWindowDimensions();

  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  const contentW = Math.min(width, MAX_CONTENT);

  return (
    <View style={styles.outer}>
      <WebExtras />
      <View style={[styles.inner, { width: contentW, maxWidth: MAX_CONTENT }]}>
        {children}
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    width: "100%",
  },
});
