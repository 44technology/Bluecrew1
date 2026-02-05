#!/bin/bash

echo "🔧 Uyarıları bastırıp projeyi yeniden derliyoruz..."

cd "$(dirname "$0")"

# Podfile'ı güncelledik, şimdi pods'u yeniden yüklüyoruz
echo "📦 CocoaPods bağımlılıklarını yeniden yüklüyoruz..."
cd ios
pod deintegrate
pod install
cd ..

# Xcode DerivedData'yı temizliyoruz
echo "🧹 Xcode DerivedData'yı temizliyoruz..."
rm -rf ~/Library/Developer/Xcode/DerivedData/BlueCrew-*

echo ""
echo "✅ Tamamlandı!"
echo ""
echo "Şimdi Xcode'da:"
echo "1. Product > Clean Build Folder (Shift+Cmd+K)"
echo "2. Product > Build (Cmd+B)"
echo ""
echo "Not: Çoğu uyarı üçüncü taraf kütüphanelerden geliyor ve"
echo "     uygulamanın çalışmasını engellemez. Sadece uyarılar."
