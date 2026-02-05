#!/bin/bash

# İnternet bağlantısı geldiğinde çalıştırılacak script

set -e

echo "🚀 iOS Build Başlatılıyor..."
echo ""

cd "$(dirname "$0")"

# 1. EAS CLI kurulumu
echo "📦 EAS CLI kuruluyor..."
npm install -g eas-cli

# 2. EAS login (ilk kez)
echo "🔐 EAS'a giriş yapılıyor..."
eas login

# 3. Build seçenekleri
echo ""
echo "Build yöntemi seçin:"
echo "1. EAS Cloud Build (önerilen, otomatik)"
echo "2. Lokal Build (hızlı, CocoaPods gerekir)"
echo ""
read -p "Seçiminiz (1/2) [1]: " choice
choice=${choice:-1}

if [ "$choice" == "2" ]; then
    # Lokal build için CocoaPods kur
    echo "📦 CocoaPods kuruluyor..."
    sudo gem install cocoapods
    
    # Prebuild
    echo "📱 iOS native kodları oluşturuluyor..."
    npx expo prebuild --platform ios
    
    # Pod install
    echo "📦 CocoaPods bağımlılıkları yükleniyor..."
    cd ios
    pod install
    cd ..
    
    # Lokal build
    echo "🚀 Lokal build başlatılıyor..."
    eas build --platform ios --local --profile production
else
    # Cloud build
    echo "☁️  Cloud build başlatılıyor..."
    eas build --platform ios --profile production
fi

echo ""
echo "✅ Build tamamlandı!"
