#!/bin/bash

# iOS Build Başlatma Scripti
# Terminal'i yeniden başlattıktan sonra çalıştırın

set -e

echo "🚀 iOS Build Başlatılıyor..."
echo ""

cd "$(dirname "$0")"

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı!"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# EAS CLI kontrolü ve kurulumu
if ! command -v eas &> /dev/null; then
    echo "📦 EAS CLI kuruluyor..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI zaten kurulu: $(eas --version)"
fi
echo ""

# EAS login kontrolü
echo "🔐 EAS hesabınızı kontrol ediliyor..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  EAS'a giriş yapmanız gerekiyor"
    eas login
fi

echo ""
echo "📱 Build profili seçin:"
echo "1. Development (test için)"
echo "2. Preview (TestFlight öncesi)"
echo "3. Production (App Store için) - ÖNERİLEN"
echo ""
read -p "Seçiminiz (1/2/3) [3]: " profile_choice
profile_choice=${profile_choice:-3}

case $profile_choice in
    1) profile="development" ;;
    2) profile="preview" ;;
    3) profile="production" ;;
    *) profile="production" ;;
esac

echo ""
echo "🌐 Build yöntemi seçin:"
echo "1. EAS Cloud Build (kolay, 15-30 dakika)"
echo "2. Lokal Build (hızlı, 5-10 dakika, CocoaPods gerekir)"
echo ""
read -p "Seçiminiz (1/2) [1]: " build_method
build_method=${build_method:-1}

if [ "$build_method" == "2" ]; then
    echo ""
    echo "🔧 Lokal build için hazırlık yapılıyor..."
    
    # CocoaPods kontrolü
    if ! command -v pod &> /dev/null; then
        echo "📦 CocoaPods kuruluyor..."
        sudo gem install cocoapods
    fi
    
    # Prebuild
    echo "📱 iOS native kodları oluşturuluyor/güncelleniyor..."
    npx expo prebuild --platform ios
    
    # Pod install
    echo "📦 CocoaPods bağımlılıkları yükleniyor..."
    cd ios
    pod install
    cd ..
    
    echo ""
    echo "🚀 Lokal build başlatılıyor..."
    eas build --platform ios --local --profile "$profile"
else
    echo ""
    echo "☁️  Cloud build başlatılıyor..."
    echo "⏱️  Bu işlem 15-30 dakika sürebilir..."
    eas build --platform ios --profile "$profile"
fi

echo ""
echo "✅ Build işlemi başlatıldı!"
echo "📱 Build durumunu kontrol etmek için: eas build:list"
echo "📱 Build loglarını görmek için: eas build:view [BUILD_ID]"
