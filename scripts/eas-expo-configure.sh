#!/usr/bin/env bash
# EAS Build: generate ExpoModulesProvider.swift after pod install so Xcode phase can skip.
# Runs in eas-build-post-install (after npm install + pod install), only for iOS.

set -e
if [ "$EAS_BUILD_PLATFORM" != "ios" ]; then
  exit 0
fi

OUTPUT="ios/Pods/Target Support Files/Pods-BlueCrew/ExpoModulesProvider.swift"
if [ ! -f "ios/Podfile" ]; then
  echo "[eas-expo-configure] No ios/Podfile, skipping."
  exit 0
fi
if [ ! -d "ios/Pods/Target Support Files/Pods-BlueCrew" ]; then
  echo "[eas-expo-configure] Pods not installed yet, skipping (Xcode phase will generate)."
  exit 0
fi

echo "[eas-expo-configure] Generating ExpoModulesProvider.swift for EAS iOS build..."
NODE=$(command -v node 2>/dev/null || true)
[ -z "$NODE" ] && NODE="/usr/local/bin/node"
[ ! -x "$NODE" ] && [ -x "/opt/homebrew/bin/node" ] && NODE="/opt/homebrew/bin/node"

"$NODE" --no-warnings --eval "require('expo/bin/autolinking')" expo-modules-autolinking generate-modules-provider \
  --target "$OUTPUT" \
  --entitlement "ios/BlueCrew/BlueCrew.entitlements" \
  --platform "apple" \
  --packages "expo" "expo-asset" "expo-blur" "expo-camera" "expo-constants" "expo-dev-launcher" "expo-dev-menu" "expo-document-picker" "expo-file-system" "expo-font" "expo-haptics" "expo-image-picker" "expo-keep-awake" "expo-linear-gradient" "expo-linking" "expo-location" "expo-router" "expo-splash-screen" "expo-symbols" "expo-system-ui" "expo-web-browser"

echo "[eas-expo-configure] Done."
exit 0
