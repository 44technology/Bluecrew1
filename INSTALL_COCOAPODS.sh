#!/bin/bash

# CocoaPods Kurulum Scripti

set -e

echo "📦 CocoaPods Kurulumu Başlatılıyor..."
echo ""

# 1. Xcode Command Line Tools kontrolü
echo "🔍 Xcode Command Line Tools kontrol ediliyor..."
if ! xcode-select -p &> /dev/null; then
    echo "⚠️  Xcode Command Line Tools bulunamadı!"
    echo "📥 Kurulum başlatılıyor..."
    xcode-select --install
    echo ""
    echo "⏳ Kurulum tamamlanana kadar bekleyin (5-10 dakika)"
    echo "   Kurulum tamamlandıktan sonra bu script'i tekrar çalıştırın"
    exit 0
else
    echo "✅ Xcode Command Line Tools kurulu"
fi

# 2. Ruby versiyonu kontrolü
echo "🔍 Ruby versiyonu kontrol ediliyor..."
ruby_version=$(ruby --version 2>&1 | head -1)
echo "   $ruby_version"

# 3. CocoaPods kurulum yöntemi seçimi
echo ""
echo "CocoaPods kurulum yöntemi:"
echo "1. Gem ile (önerilen)"
echo "2. Homebrew ile (eğer Homebrew kuruluysa)"
echo ""
read -p "Seçiminiz (1/2) [1]: " method
method=${method:-1}

if [ "$method" == "2" ]; then
    # Homebrew ile kurulum
    if command -v brew &> /dev/null; then
        echo "📦 Homebrew ile CocoaPods kuruluyor..."
        brew install cocoapods
    else
        echo "❌ Homebrew bulunamadı, gem ile kurulum yapılıyor..."
        method=1
    fi
fi

if [ "$method" == "1" ]; then
    # Gem ile kurulum
    echo "📦 Gem ile CocoaPods kuruluyor..."
    echo "   Bu işlem birkaç dakika sürebilir..."
    
    # Sudo ile kurulum
    sudo gem install cocoapods
    
    # CocoaPods repo setup
    echo "📚 CocoaPods repo kurulumu yapılıyor..."
    pod setup || echo "⚠️  Repo setup atlandı (zaten kurulu olabilir)"
fi

# 4. Kurulum kontrolü
echo ""
echo "🔍 CocoaPods kurulumu kontrol ediliyor..."
if command -v pod &> /dev/null; then
    pod_version=$(pod --version)
    echo "✅ CocoaPods kuruldu: $pod_version"
else
    echo "❌ CocoaPods hala bulunamadı!"
    echo ""
    echo "Manuel kurulum için:"
    echo "  sudo gem install cocoapods"
    echo "  pod setup"
    exit 1
fi

echo ""
echo "✅ CocoaPods kurulumu tamamlandı!"
echo "🚀 Şimdi build script'ini çalıştırabilirsiniz:"
echo "   bash FIX_BUILD_AND_RETRY.sh"
