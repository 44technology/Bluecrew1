#!/bin/bash

# CocoaPods PATH Düzeltme Scripti

echo "🔧 CocoaPods PATH Düzeltiliyor..."
echo ""

# CocoaPods'un tam path'ini bul
POD_PATH=$(find /opt/homebrew /usr/local ~/.gem -name "pod" -type f 2>/dev/null | head -1)

if [ -z "$POD_PATH" ]; then
    echo "❌ CocoaPods bulunamadı!"
    echo "Lütfen önce CocoaPods'u kurun: gem install cocoapods"
    exit 1
fi

echo "✅ CocoaPods bulundu: $POD_PATH"
echo ""

# CocoaPods'un bulunduğu dizini al
POD_DIR=$(dirname "$POD_PATH")
echo "📁 CocoaPods dizini: $POD_DIR"
echo ""

# PATH'e ekle
if [[ ":$PATH:" != *":$POD_DIR:"* ]]; then
    echo "📝 PATH'e ekleniyor..."
    
    # ~/.zshrc'ye ekle
    if ! grep -q "$POD_DIR" ~/.zshrc 2>/dev/null; then
        echo "" >> ~/.zshrc
        echo "# CocoaPods PATH" >> ~/.zshrc
        echo "export PATH=\"$POD_DIR:\$PATH\"" >> ~/.zshrc
        echo "✅ ~/.zshrc'ye eklendi"
    else
        echo "✅ ~/.zshrc'de zaten var"
    fi
    
    # Mevcut session'a ekle
    export PATH="$POD_DIR:$PATH"
    echo "✅ Mevcut session'a eklendi"
else
    echo "✅ PATH'te zaten var"
fi

echo ""
echo "🧪 Test ediliyor..."
if command -v pod &> /dev/null; then
    echo "✅ CocoaPods çalışıyor: $(pod --version)"
    echo ""
    echo "🎉 Başarılı! Artık 'pod' komutunu kullanabilirsiniz."
    echo ""
    echo "📋 Sonraki adım:"
    echo "   cd ios && pod install"
else
    echo "⚠️  Hala çalışmıyor. Terminal'i kapatıp yeniden açın:"
    echo "   source ~/.zshrc"
    echo "   pod --version"
fi
