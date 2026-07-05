// app/about.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable, Linking, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import { colors } from "../src/theme";

function Link({ url, label }: { url: string; label: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backIcon}>{"←"}</Text>
      </Pressable>
      <Text style={styles.title}>About</Text>
      <Text style={styles.body}>
        Sequence Trip visualizes and sonifies integer sequences from the On-Line
        Encyclopedia of Integer Sequences® (OEIS®).
      </Text>
      <Text style={styles.heading}>Data & attribution</Text>
      <Text style={styles.body}>
        All sequence data comes from the OEIS, published by The OEIS Foundation Inc.
        under the Creative Commons Attribution Share-Alike 4.0 license. This app is
        not affiliated with or endorsed by The OEIS Foundation.
      </Text>
      <Link url="https://oeis.org" label="oeis.org" />
      <Link
        url="https://creativecommons.org/licenses/by-sa/4.0/"
        label="CC BY-SA 4.0 license"
      />
      <Link
        url="https://oeis.org/wiki/The_OEIS_End-User_License_Agreement"
        label="OEIS End-User License Agreement"
      />
      <Text style={styles.heading}>Privacy</Text>
      <Text style={styles.body}>
        The app works offline and collects no data. Fetching extra terms for a
        sequence downloads its b-file directly from oeis.org; nothing else leaves
        your device.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backIcon: {
    color: colors.text,
    fontSize: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  link: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 6,
  },
});
