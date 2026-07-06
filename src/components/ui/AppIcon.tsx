// src/components/ui/AppIcon.tsx

import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

export type AppIconName = keyof typeof Ionicons.glyphMap;

interface Props {
  name: AppIconName;
  size?: number;
  color?: string;
}

export default function AppIcon({ name, size = 20, color = colors.text }: Props) {
  return <Ionicons name={name} size={size} color={color} />;
}
