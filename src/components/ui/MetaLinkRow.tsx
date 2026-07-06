// src/components/ui/MetaLinkRow.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";
import ExternalLink from "./ExternalLink";
import NavLink, { type NavLinkVariant } from "./NavLink";

export interface MetaLinkItem {
  label: string;
  href?: string;
  url?: string;
  variant?: NavLinkVariant;
  testID?: string;
}

interface Props {
  items: MetaLinkItem[];
  separator?: string;
}

export default function MetaLinkRow({ items, separator = "·" }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <React.Fragment key={`${item.label}-${i}`}>
          {i > 0 ? <Text style={styles.sep}>{separator}</Text> : null}
          {item.url ? (
            <ExternalLink url={item.url} label={item.label} inline />
          ) : (
            <NavLink
              href={item.href ?? "/about"}
              label={item.label}
              variant={item.variant ?? "accent"}
              testID={item.testID}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    flexWrap: "wrap",
  },
  sep: {
    color: colors.textMuted,
    fontSize: 12,
  },
});

/** OEIS A-number + optional help link (visualize header). */
export function OeisMetaRow({ anum, showHelp = true }: { anum: string; showHelp?: boolean }) {
  const items: MetaLinkItem[] = [
    { label: anum, url: `https://oeis.org/${anum}` },
  ];
  if (showHelp) {
    items.push({ label: "Help", href: "/about", variant: "muted", testID: "controls-info" });
  }
  return <MetaLinkRow items={items} />;
}
