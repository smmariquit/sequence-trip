import React from "react";
// app/_layout.tsx

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import * as Notifications from "expo-notifications";
import NotificationRouter from "../src/notifications/NotificationRouter";
import ErrorBoundary from "../src/components/ErrorBoundary";
import WebPageShell from "../src/components/WebPageShell";
import { AmbientProvider } from "../src/audio/AmbientContext";
import { useThemeColors } from "../src/theme";
import { loadVizColorPrefs } from "../src/visualizations/vizColorStore";
import { loadMusicSettings } from "../src/audio/musicSettings";
import { loadNotifySettings } from "../src/notifications/notifyStore";
import { rescheduleDaily } from "../src/notifications/scheduler";
import { writeWidgetSnapshot } from "../src/widget/snapshot";
import { loadGameProgress } from "../src/game/progressStore";

// show a banner when a scheduled notification fires while the app is foregrounded
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export default function RootLayout() {
  const colors = useThemeColors();
  const scheme = useColorScheme();

  React.useEffect(() => {
    void loadVizColorPrefs();
    void loadMusicSettings();
    void loadNotifySettings().then(rescheduleDaily);
    void loadGameProgress();
    void writeWidgetSnapshot();
  }, []);

  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const appTheme = React.useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.bg,
        card: colors.bg,
        border: colors.border,
        primary: colors.accent,
        text: colors.text,
      },
    };
  }, [colors, scheme]);

  return (
    <ErrorBoundary fallbackText="App failed to load">
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
        <ThemeProvider value={appTheme}>
          <AmbientProvider>
          {Platform.OS !== "web" ? <NotificationRouter /> : null}
          <WebPageShell>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="visualize/[id]"
                options={{
                  headerShown: false,
                  animation: Platform.OS === "web" ? "fade" : "slide_from_right",
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />
            </Stack>
          </WebPageShell>
          </AmbientProvider>
        </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
