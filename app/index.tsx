// app/index.tsx

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { colors } from "../src/theme";
import { sequences } from "../src/sequences/catalog";
import SequenceCard from "../src/components/SequenceCard";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.logo}>✦ Sequence Trip</Text>
          <Text style={styles.subtitle}>
            Trippy visualizations of OEIS integer sequences
          </Text>
        </View>
        {sequences.map((seq, i) => (
          <SequenceCard key={seq.id} sequence={seq} index={i} />
        ))}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data from the On-Line Encyclopedia of Integer Sequences
          </Text>
          <Text style={styles.footerLink}>oeis.org</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  logo: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    marginTop: 6,
    lineHeight: 21,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  footerLink: {
    color: colors.accent,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
});
