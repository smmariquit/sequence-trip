// src/components/ui/InfoSectionBlock.tsx

import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";
import type { InfoSection } from "../../content/infoContent";
import { containsLatexDelimiters } from "../../math/latexDelimiters";
import MathText from "../MathText";
import SectionHeading from "./SectionHeading";
import BodyText from "./BodyText";
import BulletRow from "./BulletRow";
import ExternalLink from "./ExternalLink";
import SequenceChip from "./SequenceChip";

interface Props {
  section: InfoSection;
}

export default function InfoSectionBlock({ section }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.section} testID={`info-section-${section.id}`}>
      <SectionHeading size="info" style={styles.heading}>{section.title}</SectionHeading>
      {section.image ? (
        <View style={styles.figure}>
          <Image
            source={section.image.source}
            style={[styles.image, { aspectRatio: section.image.aspectRatio }]}
            resizeMode="cover"
            accessible
            accessibilityRole="image"
            accessibilityLabel={section.image.caption}
          />
          <BodyText variant="caption">{section.image.caption}</BodyText>
          <ExternalLink
            url={section.image.creditUrl}
            label={section.image.credit}
            inline
          />
        </View>
      ) : null}
      {section.body?.map((paragraph) =>
        containsLatexDelimiters(paragraph) ? (
          <MathText key={paragraph.slice(0, 24)} style={styles.mathBody}>
            {paragraph}
          </MathText>
        ) : (
          <BodyText key={paragraph.slice(0, 24)}>{paragraph}</BodyText>
        )
      )}
      {section.bullets?.map((item) => (
        <BulletRow key={item.slice(0, 24)}>{item}</BulletRow>
      ))}
      {section.anums?.length ? (
        <View style={styles.chipRow}>
          {section.anums.map((anum) => (
            <SequenceChip key={anum} anum={anum} />
          ))}
        </View>
      ) : null}
      {section.links?.map((link) => (
        <ExternalLink key={link.url} url={link.url} label={link.label} />
      ))}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  section: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  // the divider already separates sections; the heading's own top margin
  // would double the gap above it while content sits tight below
  heading: {
    marginTop: 0,
  },
  mathBody: {
    color: colors.textDim,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  figure: {
    gap: 6,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
});
