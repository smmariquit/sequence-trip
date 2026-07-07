// src/components/SequenceEntryPanel.tsx
//
// Full OEIS entry — formulas, keywords, programs, xrefs, for nerds.

import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { fetchOeisEntry } from "../oeis/fetchEntry";
import type { OEISFullEntry } from "../oeis/entryTypes";
import {
  extractAnums,
  parseOeisLink,
  stripOeisMarkup,
} from "../oeis/entryText";
import { tokenizeCode } from "../oeis/codeTokens";
import { formatOeisLine } from "../oeis/oeisMath";
import { keywordMeaning } from "../oeis/keywordInfo";
import MathText from "./MathText";
import { useThemeColors } from "../theme";
import { safeAreaTop } from "../theme/layout";
import { spacing, radii, typography } from "../theme/tokens";
import AppIcon from "./ui/AppIcon";
import ExternalLink from "./ui/ExternalLink";
import PlainText from "./PlainText";

interface Props {
  anum: string;
  visible: boolean;
  onClose: () => void;
}

export default function SequenceEntryPanel({ anum, visible, onClose }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const [entry, setEntry] = useState<OEISFullEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setEntry(null);
    fetchOeisEntry(anum)
      .then((hit) => {
        if (cancelled) return;
        if (!hit) setError(true);
        else setEntry(hit);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [anum, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onClose}
    >
      <View style={styles.container} testID="sequence-entry-panel">
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>OEIS entry</Text>
            <Text style={styles.subtitle}>{anum}</Text>
          </View>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            testID="sequence-entry-close"
            accessibilityLabel="Close OEIS entry"
          >
            <AppIcon name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Fetching from oeis.org…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <PlainText style={styles.errorText}>
              Could not load this entry. Check your connection or open it on oeis.org.
            </PlainText>
            <ExternalLink url={`https://oeis.org/${anum}`} label={`Open ${anum} on OEIS`} />
          </View>
        ) : entry ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <MetaRow label="A-number" value={entry.anum} />
            {entry.legacyId ? <MetaRow label="Legacy ID" value={entry.legacyId} /> : null}
            {entry.offset ? <MetaRow label="Offset" value={entry.offset} /> : null}
            {entry.author ? (
              <Section title="Author">
                <Body>{stripOeisMarkup(entry.author)}</Body>
              </Section>
            ) : null}
            {entry.keyword.length > 0 ? (
              <Section title="Keywords">
                {entry.keyword.map((k) => (
                  <View key={k} style={styles.keywordRow}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{k}</Text>
                    </View>
                    <Text style={styles.keywordMeaning}>
                      {keywordMeaning(k) ?? "No standard meaning. See oeis.org/wiki/Keywords."}
                    </Text>
                  </View>
                ))}
              </Section>
            ) : null}
            <Section title="Definition">
              <FormulaLine>{entry.name}</FormulaLine>
            </Section>
            {entry.data ? (
              <Section title="Data">
                <CodeBlock>{entry.data}</CodeBlock>
              </Section>
            ) : null}
            {entry.formula.length > 0 ? (
              <Section title="Formula">
                {entry.formula.map((line) => (
                  <FormulaLine key={line.slice(0, 40)}>{line}</FormulaLine>
                ))}
              </Section>
            ) : null}
            {entry.example.length > 0 ? (
              <Section title="Example">
                {entry.example.map((line) => (
                  <FormulaLine key={line.slice(0, 40)}>{line}</FormulaLine>
                ))}
              </Section>
            ) : null}
            {entry.program.length > 0 ? (
              <Section title="Code">
                <CodeBlock>{entry.program.join("\n\n")}</CodeBlock>
              </Section>
            ) : null}
            {entry.maple.length > 0 ? (
              <Section title="Maple">
                <CodeBlock>{entry.maple.join("\n\n")}</CodeBlock>
              </Section>
            ) : null}
            {entry.mathematica.length > 0 ? (
              <Section title="Mathematica">
                <CodeBlock>{entry.mathematica.join("\n\n")}</CodeBlock>
              </Section>
            ) : null}
            {entry.comment.length > 0 ? (
              <Section title="Comments">
                {entry.comment.map((line) => (
                  <Body key={line.slice(0, 48)}>{stripOeisMarkup(line)}</Body>
                ))}
              </Section>
            ) : null}
            {entry.reference.length > 0 ? (
              <Section title="References">
                {entry.reference.map((line) => (
                  <Body key={line.slice(0, 48)}>{stripOeisMarkup(line)}</Body>
                ))}
              </Section>
            ) : null}
            {entry.link.length > 0 ? (
              <Section title="Links">
                {entry.link.map((line) => {
                  const parsed = parseOeisLink(line);
                  return parsed.url ? (
                    <ExternalLink
                      key={parsed.url}
                      url={parsed.url}
                      label={parsed.label}
                      style={styles.link}
                    />
                  ) : (
                    <Body key={line.slice(0, 40)}>{parsed.label}</Body>
                  );
                })}
              </Section>
            ) : null}
            {entry.xref.length > 0 ? (
              <Section title="Cross-references">
                {entry.xref.map((line) => (
                  <View key={line.slice(0, 48)} style={styles.xrefBlock}>
                    <Body>{stripOeisMarkup(line)}</Body>
                    <View style={styles.xrefChips}>
                      {extractAnums(line).map((a) => (
                        <View key={a} style={styles.xrefPair}>
                          <Pressable
                            style={styles.xrefChip}
                            accessibilityRole="button"
                            accessibilityLabel={`Open sequence ${a}`}
                            onPress={() => {
                              onClose();
                              router.push(`/visualize/${a}`);
                            }}
                          >
                            <Text style={styles.xrefChipText}>{a}</Text>
                          </Pressable>
                          <Pressable
                            style={styles.xrefCompare}
                            accessibilityRole="button"
                            accessibilityLabel={`Compare ${anum} with ${a}`}
                            onPress={() => {
                              onClose();
                              router.push(`/compare/${anum}-${a}`);
                            }}
                          >
                            <AppIcon name="git-compare-outline" size={13} color={colors.textMuted} />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </Section>
            ) : null}
            {entry.ext.length > 0 ? (
              <Section title="Extensions">
                {entry.ext.map((line) => (
                  <Body key={line.slice(0, 40)}>{stripOeisMarkup(line)}</Body>
                ))}
              </Section>
            ) : null}
            {(entry.created || entry.revision) ? (
              <Section title="History">
                {entry.created ? <MetaRow label="Created" value={entry.created} /> : null}
                {entry.revision ? <MetaRow label="Revision" value={entry.revision} /> : null}
                {entry.time ? <MetaRow label="Last edit" value={entry.time} /> : null}
              </Section>
            ) : null}
            <ExternalLink
              url={`https://oeis.org/${entry.anum}`}
              label="View canonical entry on oeis.org"
              style={styles.footerLink}
            />
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function Body({ children }: { children: string }) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  return <PlainText style={styles.body}>{children}</PlainText>;
}

/** Entry line that typesets as LaTeX when it is unambiguously a formula. */
function FormulaLine({ children }: { children: string }) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { text, isMath } = formatOeisLine(stripOeisMarkup(children));
  if (isMath) return <MathText style={styles.body}>{text}</MathText>;
  return <PlainText style={styles.body}>{text}</PlainText>;
}

function CodeBlock({ children }: { children: string }) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const tokens = React.useMemo(() => tokenizeCode(children), [children]);
  const tokenColor: Record<string, string> = {
    kw: colors.interactive,
    num: colors.neonCyan,
    str: colors.neonGreen,
    com: colors.textMuted,
    tag: colors.accentAlt,
  };
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Text style={styles.code}>
        {tokens.map((t, i) =>
          t.type === "plain" ? (
            t.text
          ) : (
            <Text key={i} style={{ color: tokenColor[t.type] }}>
              {t.text}
            </Text>
          )
        )}
      </Text>
    </ScrollView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: safeAreaTop("info"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.primary,
    ...typography.label,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textDim,
    fontSize: 14,
  },
  errorText: {
    color: colors.textDim,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  code: {
    color: colors.interactive,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Menlo" : Platform.OS === "web" ? "monospace" : "monospace",
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  keywordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  keywordMeaning: {
    color: colors.textDim,
    fontSize: 14,
    flex: 1,
  },
  chip: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    minWidth: 72,
  },
  metaValue: {
    color: colors.textDim,
    fontSize: 13,
    flex: 1,
    fontVariant: ["tabular-nums"],
  },
  link: {
    marginBottom: spacing.xs,
  },
  xrefBlock: {
    marginBottom: spacing.sm,
  },
  xrefChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  xrefPair: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  xrefChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: radii.sm,
    borderBottomLeftRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  xrefCompare: {
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.border,
    borderTopRightRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
    paddingHorizontal: 6,
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  xrefChipText: {
    color: colors.interactive,
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  footerLink: {
    marginTop: spacing.md,
  },
});
