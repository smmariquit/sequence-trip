# OTA update compliance (Sequence Trip)

How we use **EAS Update** (`expo-updates`) without violating [Google Play](https://support.google.com/googleplay/android-developer/answer/16559646) or [Apple App Review](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/) rules.

At ~100 users, OTA is for **fast JS hotfixes** between store builds. Store builds remain the path for **native changes** and **major product shifts**.

## Store policy (what actually applies)

### Google Play — Device and Network Abuse

> An app distributed via Google Play may not modify, replace, or update itself using any method other than Google Play's update mechanism. Likewise, an app may not download executable code (such as dex, JAR, .so files) from a source other than Google Play. **This restriction does not apply to code that runs in a virtual machine or an interpreter** where either provides indirect access to Android APIs (such as JavaScript in a webview or browser).

Source: [Device and Network Abuse](https://support.google.com/googleplay/android-developer/answer/16559646)

React Native / Expo JS bundles run in Hermes (an interpreter). EAS Update is in-policy **when the update stays in interpreted JS/assets** and still follows all other Play policies (privacy, malware, deceptive behavior, etc.).

### Apple — interpreted code (License Agreement §3.3.2)

Interpreted code may be downloaded at runtime **only if it does not change the primary purpose** of the application by providing features or functionality inconsistent with the intended and advertised purpose.

Apple is stricter in practice than Google: use OTA for **bug fixes, polish, and content** inside the same app category. Ship a **new store binary** when the app’s core purpose or major capabilities change.

### Myth: “reviewers reject apps that have OTA at all”

Thousands of Expo and React Native apps ship with `expo-updates` or similar and pass review. Rejection risk rises when you **abuse** OTA (hidden features, policy bypass, native code sideload). A compliant OTA mechanism is normal.

## OTA vs store (pros / cons at small scale)

| | **EAS Update (OTA)** | **Play / App Store build** |
| --- | --- | --- |
| **Speed** | Minutes after `eas update` | Review: hours to days |
| **Scope** | JS/TS, styles, images, fonts, JSON config bundled in the update | Native modules, permissions, manifest, SDK bumps, new plugins |
| **User friction** | Background download; applies on next cold start (default) | User taps Update in store |
| **Risk** | Policy violation if you ship “new app” behavior OTA | Heavier process, but right place for native work |
| **~100 users** | Ideal for viz bugs, caption copy, daily puzzle logic, search UI | Required for widget, notifications, Skia, SQLite native, `versionCode` bumps |

**Backend note (from Ayusin-PH workflow):** if a mobile release depends on a new API shape, either keep the API backward compatible until store adoption catches up, or gate the client feature on app version. OTA does not replace coordinating server deploys.

## What we may ship OTA

Compliant for Sequence Trip (OEIS visualizer + daily puzzle; same advertised purpose):

- Bug fixes in React components, playback math, captions, search UI
- Viz drawing tweaks (Skia/ canvas **JS** only; no native Skia binary change)
- Copy, theming, color presets, animation timing
- Daily puzzle logic and streak UI (JS)
- Remote config-style flags **inside** the existing feature set
- Small image/font assets in the update bundle

## What requires a store build

Never OTA these:

- New or upgraded **native modules** (`expo-*` version bumps that change native code)
- `app.json` **plugins**, Android permissions, iOS entitlements
- **Widget**, notifications, or manifest configuration changes
- Bundled **`assets/oeis.db`** refresh (shipped in the native binary via `eas-build-post-install`; ~130MB, wrong channel for OTA anyway)
- Changing the app’s **primary purpose** (e.g. turning a viz app into a social network or marketplace)
- Downloading **dex / .so / JAR** or any non-interpreter executable from outside Play

When in doubt: if you ran `npx expo prebuild` or changed `package.json` native deps → **store build**.

## Runtime version rule

`app.json` uses `"runtimeVersion": { "policy": "appVersion" }`.

- OTA updates apply only to builds whose **app version** matches the published update.
- After a **store release** bumps `expo.version` (and you ship a new binary), publish OTA to that same version channel or bump version first, then build, then OTA.

If native code changes without bumping `expo.version`, use [EAS fingerprint runtime](https://docs.expo.dev/eas-update/runtime-versions/) instead. Today we tie runtime to app version for simplicity.

## Channels (this repo)

| EAS build profile | Update channel | Use |
| --- | --- | --- |
| `development` | `development` | Dev client only |
| `preview` | `preview` | Internal APK testers |
| `production` | `production` | Closed / open / production store builds |

Closed testing builds must use the **`production`** channel (or a dedicated `closed` channel you set on that profile) so OTA does not leak between tracks.

## Commands

```sh
# After a production-profile EAS build is on devices:
eas update --channel production --message "fix: viz caption overflow on small phones"

# Preview APK testers:
eas update --channel preview --message "fix: daily puzzle keyboard"

# Native change → bump app.json version + versionCode, then:
eas build --platform android --profile production
# submit to Play closed/production track; OTA only after binary is live
```

Web is unaffected (`expo-updates` is native-only). Web deploy stays `npm run export:web` / hosting.

## Pre-ship checklist (every OTA)

1. Change is **JS/assets only** (see tables above).
2. Same **primary purpose** as store listing (Apple bar).
3. No new permissions, billing, or policy-sensitive behavior.
4. `npm run typecheck` and targeted tests on touched paths.
5. Message on `eas update` names the user-visible fix (audit trail).
6. If the fix needs new native code → **stop**; store build instead.

## Violations to avoid

Google and Apple both treat these seriously (account strikes possible):

- OTA that replaces core app identity or adds unreviewed major features
- Dynamic loading used to bypass store billing or policy
- Executable native code from non-Play sources
- Malware, spyware, or deceptive post-review behavior changes

## References

- [Google Play — Device and Network Abuse](https://support.google.com/googleplay/android-developer/answer/16559646)
- [Apple Developer Program License Agreement (interpreted code)](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- [Expo EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [Expo runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)
- Play closed testing prep: [issue #33](https://github.com/smmariquit/sequence-trip/issues/33)
