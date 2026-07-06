// src/components/ui/InfoSectionBlock.tsx

import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";
import type { InfoSection } from "../../content/infoContent";
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
      <SectionHeading size="info">{section.title}</SectionHeading>
      {section.body?.map((paragraph) => (
        <BodyText key={paragraph.slice(0, 24)}>{paragraph}</BodyText>
      ))}
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
});
