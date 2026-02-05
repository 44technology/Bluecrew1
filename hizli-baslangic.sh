#!/bin/bash

# Hızlı Başlangıç Scripti
# Xcode'u açar ve Metro bundler için hazırlar

set -e

echo "🚀 iOS Build Hızlı Başlangıç"
echo ""

# NVM'i yükle
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Proje dizinine git
cd "$(dirname "$0")"

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Xcode'u aç
echo "📱 Xcode açılıyor..."
open -a Xcode ios/BlueCrew.xcworkspace

echo ""
echo "✅ Xcode açıldı!"
echo ""
echo "📋 Xcode'da yapılacaklar:"
echo "1. Sol üstte 'BlueCrew' scheme'ini seçin"
echo "2. Sağ üstte bir iPhone simulator seçin (örn: iPhone 15)"
echo "3. ⌘ + R tuşlarına basarak build edin"
echo ""
echo "💡 Metro Bundler için:"
echo "   Bu terminal'de 'npm start' komutunu çalıştırın"
echo "   (Xcode build tamamlandıktan sonra)"
echo ""
read -p "Metro bundler'ı şimdi başlatmak ister misiniz? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Metro bundler başlatılıyor..."
    echo "   (Durdurmak için: Ctrl+C)"
    echo ""
    npm start
fi
