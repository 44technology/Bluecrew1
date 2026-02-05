#!/bin/bash

# iOS Build Setup Script
# Terminal'de çalıştırın: bash SETUP_AND_BUILD.sh

set -e

echo "🔧 iOS Build Kurulumu Başlatılıyor..."
echo ""

cd "$(dirname "$0")"

# 1. npm cache izin sorununu düzelt
echo "🔧 npm cache izinleri düzeltiliyor..."
sudo chown -R $(whoami) ~/.npm 2>/dev/null || echo "İzin düzeltme atlandı"

# 2. npm prefix ayarla
echo "📦 npm prefix ayarlanıyor..."
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# 3. PATH'e ekle (mevcut session için)
export PATH=~/.npm-global/bin:$PATH

# 4. EAS CLI kur
echo "📦 EAS CLI kuruluyor..."
npm install -g eas-cli

# 5. EAS CLI kontrolü
if command -v eas &> /dev/null; then
    echo "✅ EAS CLI kuruldu: $(eas --version)"
else
    echo "⚠️  EAS CLI PATH'te bulunamadı, npx ile kullanılacak"
fi

echo ""
echo "🔐 EAS'a giriş yapmanız gerekiyor..."
echo "Terminal'de şu komutu çalıştırın:"
echo "  export PATH=~/.npm-global/bin:\$PATH"
echo "  eas login"
echo ""
echo "Veya npx ile:"
echo "  npx eas-cli login"
echo ""
