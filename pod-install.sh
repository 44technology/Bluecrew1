#!/bin/bash
# "spawn pod ENOENT" hatası: Gem ile kurulan pod, Expo'nun PATH'inde yok.
# Bu script Gem bin dizinini PATH'e ekleyip pod install çalıştırır.

set -e
cd "$(dirname "$0")"

# Gem EXECUTABLE DIRECTORY'yi PATH'e ekle
GEM_BIN=$(gem environment 2>/dev/null | grep "EXECUTABLE DIRECTORY" | sed 's/.*EXECUTABLE DIRECTORY: *//' | xargs)
if [ -n "$GEM_BIN" ] && [ -x "$GEM_BIN/pod" ]; then
  export PATH="$GEM_BIN:$PATH"
fi

if ! command -v pod >/dev/null 2>&1; then
  echo "Hata: 'pod' bulunamadı. Önce: sudo gem install cocoapods"
  echo "Sonra yeni terminalde: cd $(pwd)/ios && pod install && cd .."
  exit 1
fi

echo "Running pod install in ios/..."
cd ios
pod install
cd ..
echo "✔ Bitti. Şimdi çalıştır: npx expo run:ios"
