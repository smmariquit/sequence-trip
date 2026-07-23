// Play Console compliance fixes for Android 15/16.
//
// 1. Removes expo-audio's foreground services from the merged manifest.
//    The app only plays in-app ambient audio: no lockscreen controls, no recording.
//    Play flags restricted foreground service types (mediaPlayback, microphone)
//    combined with expo-notifications' BOOT_COMPLETED receiver on Android 15+.
//
// 2. Strips deprecated edge-to-edge style params (android:statusBarColor,
//    android:enforceNavigationBarContrast) that prebuild emits. SDK 54 always
//    enables edge-to-edge at runtime, so both are dead weight that Play flags
//    as "deprecated APIs or parameters for edge-to-edge".
const { withAndroidManifest, withAndroidStyles } = require("expo/config-plugins");

const SERVICES = [
  "expo.modules.audio.service.AudioControlsService",
  "expo.modules.audio.service.AudioRecordingService",
];

const DEPRECATED_STYLE_ITEMS = [
  "android:statusBarColor",
  "android:enforceNavigationBarContrast",
];

module.exports = function withPlayConsoleFixes(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    const app = manifest.application[0];
    app.service = (app.service ?? []).filter(
      (s) => !SERVICES.includes(s.$["android:name"])
    );
    for (const name of SERVICES) {
      app.service.push({ $: { "android:name": name, "tools:node": "remove" } });
    }
    return config;
  });

  config = withAndroidStyles(config, (config) => {
    for (const style of config.modResults.resources.style ?? []) {
      if (style.$.name === "AppTheme" && style.item) {
        style.item = style.item.filter(
          (i) => !DEPRECATED_STYLE_ITEMS.includes(i.$.name)
        );
      }
    }
    return config;
  });

  return config;
};
