#!/bin/bash

# iOS Build ve Simulator Test Script
# Bu script iOS uygulamasını build edip simulator'de test eder

set -e

echo "🚀 iOS Build ve Simulator Test Başlatılıyor..."
echo ""

# Proje dizinine git
cd "$(dirname "$0")"

# Node.js kontrolü
echo "📦 Node.js kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı!"
    echo ""
    echo "Node.js kurmak için şu seçeneklerden birini kullanın:"
    echo ""
    echo "1. Homebrew ile (önerilen):"
    echo "   brew install node"
    echo ""
    echo "2. NVM ile:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   source ~/.zshrc"
    echo "   nvm install --lts"
    echo ""
    echo "3. Resmi installer:"
    echo "   https://nodejs.org/ adresinden indirin"
    echo ""
    echo "Node.js kurulduktan sonra bu script'i tekrar çalıştırın."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Bağımlılıkları kontrol et
if [ ! -d "node_modules" ]; then
    echo "📦 npm bağımlılıkları yükleniyor..."
    npm install
else
    echo "✅ npm bağımlılıkları zaten yüklü"
fi
echo ""

# CocoaPods kontrolü
echo "🍎 CocoaPods kontrol ediliyor..."
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods bulunamadı!"
    echo "Kurulum için: sudo gem install cocoapods"
    exit 1
fi

echo "✅ CocoaPods: $(pod --version)"
echo ""

# iOS bağımlılıklarını kontrol et
if [ ! -f "ios/Podfile.lock" ]; then
    echo "📦 CocoaPods bağımlılıkları yükleniyor..."
    cd ios
    pod install
    cd ..
else
    echo "✅ CocoaPods bağımlılıkları zaten yüklü"
fi
echo ""

# Xcode kontrolü
echo "🔧 Xcode kontrol ediliyor..."
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode bulunamadı!"
    echo "App Store'dan Xcode'u kurun."
    exit 1
fi

echo "✅ Xcode: $(xcodebuild -version | head -1)"
echo ""

# Simulator'leri listele
echo "📱 Mevcut simülatörler:"
xcrun simctl list devices available | grep -i "iphone" | head -5 || echo "Simulator listesi alınamadı"
echo ""

# Expo run:ios ile build ve çalıştır
echo "🚀 Expo ile iOS build ve simulator başlatılıyor..."
echo "Bu işlem birkaç dakika sürebilir..."
echo ""

# Expo run:ios komutu - otomatik olarak simulator'de açar
npx expo run:ios

echo ""
echo "✅ Build ve test işlemi tamamlandı!"
echo ""
echo "💡 İpuçları:"
echo "   - Simulator'ü kapatmak için: Cmd+Q"
echo "   - Metro bundler'ı durdurmak için: Ctrl+C"
echo "   - Xcode'da build etmek için: open -a Xcode ios/BlueCrew.xcworkspace"
