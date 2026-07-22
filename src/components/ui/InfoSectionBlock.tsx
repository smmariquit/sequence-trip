// src/components/ui/InfoSectionBlock.tsx

import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";
import type { InfoSection } from "../../content/infoContent";
import { containsLatexDelimiters } from "../../math/latexDelimiters";
import MathText from "../MathText";
import SectionHeading from "./SectionHeading";
import BodyText from "./BodyText";
import BulletRow from "./BulletRow";
import ExternalLink from "./ExternalLink";

interface Props {
  section: InfoSection;
}

export default function InfoSectionBlock({ section }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.section} testID={`info-section-${section.id}`}>
      <SectionHeading size="info" style={styles.heading}>{section.title}</SectionHeading>
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
});
