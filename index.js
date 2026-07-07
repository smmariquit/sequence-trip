// index.js
//
// Custom entry: register the Android widget task handler, then hand off to
// expo-router's normal entry. `package.json` main points here.

import { Platform } from "react-native";
import "expo-router/entry";

// registerWidgetTaskHandler uses AppRegistry.registerHeadlessTask, which only
// exists on Android. Guard so the web/iOS bundles don't throw at startup.
if (Platform.OS === "android") {
  const { registerWidgetTaskHandler } = require("react-native-android-widget");
  const { widgetTaskHandler } = require("./src/widget/widgetTaskHandler");
  registerWidgetTaskHandler(widgetTaskHandler);
}
