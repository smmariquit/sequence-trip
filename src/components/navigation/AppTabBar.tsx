// src/components/navigation/AppTabBar.tsx

import React from "react";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../../theme";
import { radii, typography } from "../../theme/tokens";
import AppIcon, { type AppIconName } from "../ui/AppIcon";

const TAB_ICONS: Record<string, { active: AppIconName; inactive: AppIconName }> = {
  index: { active: "home", inactive: "home-outline" },
  explore: { active: "compass", inactive: "compass-outline" },
  settings: { active: "settings", inactive: "settings-outline" },
  about: { active: "information-circle", inactive: "information-circle-outline" },
};

const TAB_TEST_IDS: Record<string, string> = {
  index: "tab-home",
  explore: "tab-explore",
  settings: "tab-settings",
  about: "tab-about",
};

export default function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === "web" ? 8 : 10) },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const focused = state.index === index;
        const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;

        const onPress = () => {
          if (Platform.OS !== "web") {
            Haptics.selectionAsync();
          }
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            testID={TAB_TEST_IDS[route.name]}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={typeof label === "string" ? label : route.name}
            style={({ pressed }) => [
              styles.tab,
              focused && styles.tabFocused,
              pressed && styles.tabPressed,
            ]}
          >
            <AppIcon
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={focused ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    borderRadius: radii.lg,
  },
  tabFocused: {
    backgroundColor: colors.primaryDim,
  },
  tabPressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
  },
  labelFocused: {
    color: colors.primary,
  },
});
