// app/_layout.tsx

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import ErrorBoundary from "../src/components/ErrorBoundary";
import WebPageShell from "../src/components/WebPageShell";
import { colors } from "../src/theme";

const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    border: colors.border,
    primary: colors.accent,
    text: colors.text,
  },
};

export default function RootLayout() {
  return (
    <ErrorBoundary fallbackText="App failed to load">
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
        <ThemeProvider value={appTheme}>
          <WebPageShell>
            <StatusBar style="light" />
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
        </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
