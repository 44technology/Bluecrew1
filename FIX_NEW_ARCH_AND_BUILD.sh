#!/bin/bash

# New Architecture Açık Olarak Build

set -e

echo "🔧 New Architecture ile Build Hazırlığı"
echo ""

cd "$(dirname "$0")"

# 1. New Architecture açık olduğunu kontrol et
echo "✅ New Architecture açık (app.json'da newArchEnabled: true)"
echo "   react-native-reanimated New Architecture gerektiriyor"
echo ""

# 2. Temizle
echo "🧹 Temizlik yapılıyor..."
rm -rf node_modules
rm -rf ios

# 3. Node modules yükle
echo "📦 Node modules yükleniyor..."
npm install

# 4. Prebuild (New Architecture açık)
echo "📱 iOS native kodları oluşturuluyor (New Architecture açık)..."
npx expo prebuild --platform ios --clean

# 5. GoogleService-Info.plist kontrolü
echo "🔍 GoogleService-Info.plist kontrol ediliyor..."
if [ ! -f "ios/BlueCrew/GoogleService-Info.plist" ]; then
    echo "⚠️  GoogleService-Info.plist ios/BlueCrew/ altında yok, kopyalanıyor..."
    cp GoogleService-Info.plist ios/BlueCrew/GoogleService-Info.plist
fi

# 6. CocoaPods kontrolü
echo "🔍 CocoaPods kontrol ediliyor..."
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods bulunamadı!"
    echo "📦 CocoaPods kurulumu için: bash SETUP_AFTER_HOMEBREW.sh"
    exit 1
fi

# 7. Pod install
echo "📦 CocoaPods bağımlılıkları yükleniyor..."
cd ios
pod install
cd ..

echo ""
echo "✅ Hazırlık tamamlandı!"
echo ""
echo "🚀 Build başlatmak için:"
echo "   export PATH=~/.npm-global/bin:\$PATH"
echo "   eas build --platform ios --profile production"
echo ""
echo "Veya lokal build için:"
echo "   eas build --platform ios --local --profile production"
