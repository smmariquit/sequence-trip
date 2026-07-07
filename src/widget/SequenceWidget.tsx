// src/widget/SequenceWidget.tsx
//
// Home-screen widget layout. Uses react-native-android-widget primitives
// (NOT React Native views). Tapping opens the app on the sequence via the
// existing sequencetrip:// deep link.

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetPick } from "./snapshot";

export function SequenceWidget({ pick }: { pick: WidgetPick | null }) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `sequencetrip://visualize/${pick?.anum ?? "A000045"}` }}
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#07060E",
        borderRadius: 16,
        padding: 14,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <TextWidget
        text="Sequence of the day"
        style={{ color: "#8680AA", fontSize: 11, fontWeight: "600" }}
      />
      <TextWidget
        text={pick?.anum ?? "A000045"}
        style={{ color: "#F3F0FF", fontSize: 18, fontWeight: "bold" }}
      />
      <TextWidget
        text={pick?.name ?? "Fibonacci numbers"}
        maxLines={2}
        style={{ color: "#9B94B8", fontSize: 12 }}
      />
      <TextWidget
        text={(pick?.terms ?? []).join(", ")}
        maxLines={1}
        style={{ color: "#B44AFF", fontSize: 12 }}
      />
    </FlexWidget>
  );
}
