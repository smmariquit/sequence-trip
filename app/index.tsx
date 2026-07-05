// app/index.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../src/theme";
import { sequences } from "../src/sequences/catalog";
import type { OEISSequence } from "../src/sequences/types";
import SequenceCard from "../src/components/SequenceCard";
import ResultRow from "../src/components/ResultRow";
import * as oeis from "../src/oeis/db";

const COLLECTIONS: { title: string; anums: string[] }[] = [
  {
    title: "Classics",
    anums: ["A000045", "A000040", "A000079", "A000142", "A000108", "A000217"],
  },
  {
    title: "Chaotic & weird",
    anums: ["A005132", "A006577", "A000002", "A004001", "A005185", "A006336"],
  },
  {
    title: "Digits & digits",
    anums: ["A000796", "A001113", "A002193", "A010060", "A007376", "A023811"],
  },
  {
    title: "Primes & friends",
    anums: ["A000040", "A001358", "A000961", "A002378", "A001097", "A005384"],
  },
];

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OEISSequence[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [sotd, setSotd] = useState<OEISSequence | null>(null);

  useEffect(() => {
    oeis.sequenceOfTheDay().then(setSotd).catch(() => {});
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      oeis
        .search(q)
        .then((r) => {
          setResults(r);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const goRandom = async () => {
    try {
      const seq = await oeis.random();
      router.push(`/visualize/${seq.anum}`);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroSection}>
          <Text style={styles.logo}>✦ Sequence Trip</Text>
          <Text style={styles.subtitle}>
            Trippy visualizations of all {`≈`}400,000 OEIS integer sequences
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder='Try "fibonacci", A005132, or 1,1,2,3,5'
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {results !== null ? (
          <View style={styles.results}>
            {searching && <ActivityIndicator color={colors.accent} style={styles.spinner} />}
            {!searching && results.length === 0 && (
              <Text style={styles.empty}>No sequences found</Text>
            )}
            {results.map((seq) => (
              <ResultRow key={seq.anum} sequence={seq} />
            ))}
          </View>
        ) : (
          <>
            <View style={styles.actionsRow}>
              <Pressable style={styles.actionBtn} onPress={goRandom}>
                <Text style={styles.actionText}>🎲 Random</Text>
              </Pressable>
              {sotd && (
                <Pressable
                  style={[styles.actionBtn, styles.sotdBtn]}
                  onPress={() => router.push(`/visualize/${sotd.anum}`)}
                >
                  <Text style={styles.actionText} numberOfLines={1}>
                    ✨ Today: {sotd.anum}
                  </Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.sectionTitle}>Featured</Text>
            {sequences.map((seq, i) => (
              <SequenceCard key={seq.anum} sequence={seq} index={i} />
            ))}

            {COLLECTIONS.map((col) => (
              <View key={col.title}>
                <Text style={styles.sectionTitle}>{col.title}</Text>
                <View style={styles.chipWrap}>
                  {col.anums.map((anum) => (
                    <Pressable
                      key={anum}
                      style={styles.chip}
                      onPress={() => router.push(`/visualize/${anum}`)}
                    >
                      <Text style={styles.chipText}>{anum}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        <Pressable style={styles.footer} onPress={() => router.push("/about")}>
          <Text style={styles.footerText}>
            Data from the On-Line Encyclopedia of Integer Sequences® (CC BY-SA 4.0)
          </Text>
          <Text style={styles.footerLink}>oeis.org</Text>
        </Pressable>
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
    paddingBottom: 18,
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
  searchWrap: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  search: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  results: {
    paddingHorizontal: 20,
  },
  spinner: {
    marginVertical: 16,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sotdBtn: {
    flex: 1,
  },
  actionText: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
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
