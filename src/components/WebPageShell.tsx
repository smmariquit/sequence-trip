// src/components/WebPageShell.tsx
//
// Centers content on wide desktop browsers instead of a skinny mobile column.

import React from "react";
import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";
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

    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "/manifest.webmanifest";
    document.head.appendChild(manifest);

    // offline app shell (#2) — skip localhost so dev/e2e never fight a cache
    if ("serviceWorker" in navigator && location.hostname !== "localhost") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

/** Banner when the browser reports no connectivity. */
function OfflineBanner() {
  const [offline, setOffline] = React.useState(
    typeof navigator !== "undefined" && !navigator.onLine
  );
  React.useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (!offline) return null;
  return (
    <View style={bannerStyles.banner} testID="offline-banner" accessibilityRole="alert">
      <Text style={bannerStyles.text}>
        Offline — search and cached sequences still work; new OEIS data will load when you reconnect.
      </Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  banner: {
    backgroundColor: "#7C2D12",
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  text: {
    color: "#FFEDD5",
    fontSize: 13,
    fontWeight: "600",
  },
});

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
      <OfflineBanner />
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
