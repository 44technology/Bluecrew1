#!/bin/bash

# Build Hatası Düzeltme Scripti

set -e

echo "🔧 Build Hatası Düzeltme Başlatılıyor..."
echo ""

# NVM'i yükle
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Proje dizinine git
cd "$(dirname "$0")"

echo "✅ Node.js: $(node --version)"
echo ""

# 1. Derived Data'yı temizle
echo "🧹 Derived Data temizleniyor..."
rm -rf ~/Library/Developer/Xcode/DerivedData
echo "✅ Derived Data temizlendi"
echo ""

# 2. CocoaPods bağımlılıklarını yeniden yükle
echo "📦 CocoaPods bağımlılıkları yeniden yükleniyor..."
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
echo "✅ CocoaPods bağımlılıkları yüklendi"
echo ""

# 3. node_modules'i kontrol et
echo "📦 node_modules kontrol ediliyor..."
if [ ! -d "node_modules" ]; then
    echo "node_modules bulunamadı, yükleniyor..."
    npm install
else
    echo "✅ node_modules mevcut"
fi
echo ""

# 4. .xcode.env.local kontrolü
echo "📝 .xcode.env.local kontrol ediliyor..."
if [ ! -f "ios/.xcode.env.local" ]; then
    echo "⚠️  .xcode.env.local bulunamadı, oluşturuluyor..."
    cat > ios/.xcode.env.local << 'EOF'
# Local Xcode environment configuration
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi
export NODE_BINARY="/Users/info44technology.com/.nvm/versions/node/v24.13.0/bin/node"
EOF
    echo "✅ .xcode.env.local oluşturuldu"
else
    echo "✅ .xcode.env.local mevcut"
fi
echo ""

echo "✅ Tüm düzeltmeler tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. Xcode'u kapatın (⌘ + Q)"
echo "2. Xcode'u tekrar açın: open -a Xcode ios/BlueCrew.xcworkspace"
echo "3. Product > Clean Build Folder (Shift + ⌘ + K)"
echo "4. Build edin: ⌘ + R"
