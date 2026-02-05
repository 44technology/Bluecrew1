#!/bin/bash

# iOS Build Script
# Bu script Node.js kurulduktan sonra çalıştırılmalı

set -e

echo "🚀 iOS Build Başlatılıyor..."
echo ""

# NVM'i yükle (eğer varsa)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı!"
    echo "Lütfen terminal'i yeniden başlatın veya Node.js'i PATH'e ekleyin."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Proje dizinine git
cd "$(dirname "$0")"

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
    echo "⚠️  EAS'a giriş yapmanız gerekiyor:"
    echo "   eas login"
    echo ""
    read -p "Şimdi giriş yapmak ister misiniz? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas login
    else
        echo "❌ Build için EAS girişi gereklidir."
        exit 1
    fi
fi

echo ""
echo "📱 Build profili seçin:"
echo "1. Development (test için)"
echo "2. Preview (TestFlight öncesi)"
echo "3. Production (App Store için)"
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
echo "1. EAS Cloud Build (yavaş ama kolay)"
echo "2. Lokal Build (hızlı, Mac gerekir)"
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
    echo "📱 iOS native kodları oluşturuluyor..."
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
    eas build --platform ios --profile "$profile"
fi

echo ""
echo "✅ Build işlemi tamamlandı!"
echo "📱 Build durumunu kontrol etmek için: eas build:list"
