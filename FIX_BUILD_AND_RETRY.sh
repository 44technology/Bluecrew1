#!/bin/bash

# iOS Build Hatası Düzeltme ve Tekrar Build Scripti

set -e

echo "🔧 iOS Build Hatası Düzeltiliyor..."
echo ""

cd "$(dirname "$0")"

# 1. New Architecture'ı kapattık (app.json'da newArchEnabled: false)
echo "✅ New Architecture kapatıldı (app.json'da)"

# 2. Temizle
echo "🧹 Temizlik yapılıyor..."
rm -rf node_modules
rm -rf ios

# 3. Node modules yükle
echo "📦 Node modules yükleniyor..."
npm install

# 4. Prebuild (temiz)
echo "📱 iOS native kodları oluşturuluyor..."
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
    echo "📦 CocoaPods kurulumu için: bash INSTALL_COCOAPODS.sh"
    echo "   VEYA: sudo gem install cocoapods"
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
echo "   eas build --platform ios --profile production"
echo ""
echo "Veya script'i çalıştırmak için:"
echo "   ./BUILD_NOW.sh"
