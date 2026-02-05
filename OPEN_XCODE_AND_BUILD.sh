#!/bin/bash

# Xcode ile Hata Görüntüleme

cd "$(dirname "$0")"

echo "🔧 Xcode ile Hata Görüntüleme"
echo ""

# Workspace kontrolü
if [ ! -d "ios/BlueCrew.xcworkspace" ]; then
    echo "⚠️  Xcode workspace bulunamadı, prebuild yapılıyor..."
    
    rm -rf ios
    npx expo prebuild --platform ios --clean
    
    if command -v pod &> /dev/null; then
        cd ios
        pod install
        cd ..
    else
        echo "❌ CocoaPods bulunamadı!"
        exit 1
    fi
fi

echo "📱 Xcode açılıyor..."
echo ""
echo "Xcode'da yapmanız gerekenler:"
echo "1. Sol üstten bir iOS simülatör seçin (örn: iPhone 15)"
echo "2. Product > Build (⌘B) yapın"
echo "3. Build başarısız olduğunda:"
echo "   - Sol panelde Issue Navigator'ı açın (⌘5)"
echo "   - Kırmızı hataları göreceksiniz"
echo "   - İlk 2-3 hatayı kopyalayıp bana gönderin"
echo ""

open ios/BlueCrew.xcworkspace

echo "✅ Xcode açıldı!"
