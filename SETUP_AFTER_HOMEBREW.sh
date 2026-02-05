#!/bin/bash

# Homebrew Kurulumu Sonrası Setup

set -e

echo "🔧 Homebrew Sonrası Kurulum"
echo ""

# PATH'e Homebrew ekle
export PATH="/opt/homebrew/bin:$PATH"

# Homebrew kontrolü
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew bulunamadı!"
    echo "   Terminal'i yeniden başlatın veya:"
    echo "   export PATH=\"/opt/homebrew/bin:\$PATH\""
    exit 1
fi

echo "✅ Homebrew kurulu: $(brew --version | head -1)"
echo ""

# Ruby kurulumu seçenekleri
echo "Ruby kurulum yöntemi:"
echo "1. rbenv ile Ruby 3.x kur (önerilen, versiyon yönetimi için)"
echo "2. Homebrew ile direkt Ruby kur (daha basit)"
echo ""
read -p "Seçiminiz (1/2) [1]: " ruby_choice
ruby_choice=${ruby_choice:-1}

if [ "$ruby_choice" == "1" ]; then
    # rbenv ile Ruby kurulumu
    echo ""
    echo "📦 rbenv kuruluyor..."
    brew install rbenv ruby-build
    
    # PATH'e ekle
    if ! grep -q 'rbenv' ~/.zshrc; then
        echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
        echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
    fi
    
    # Mevcut session için aktif et
    export PATH="$HOME/.rbenv/bin:$PATH"
    eval "$(rbenv init - zsh)"
    
    echo ""
    echo "📦 Ruby 3.3.0 kuruluyor..."
    echo "   Bu işlem 5-10 dakika sürebilir..."
    rbenv install 3.3.0
    rbenv global 3.3.0
    
    # Yeni Ruby'yi aktif et
    eval "$(rbenv init - zsh)"
    
    echo ""
    echo "✅ Ruby kuruldu: $(ruby --version)"
    
elif [ "$ruby_choice" == "2" ]; then
    # Homebrew ile direkt Ruby
    echo ""
    echo "📦 Ruby kuruluyor..."
    brew install ruby
    
    # PATH'e ekle
    if ! grep -q 'homebrew.*ruby' ~/.zshrc; then
        echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
    fi
    
    export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
    
    echo ""
    echo "✅ Ruby kuruldu: $(ruby --version)"
fi

# CocoaPods kurulumu
echo ""
echo "📦 CocoaPods kuruluyor..."
gem install cocoapods

# CocoaPods kontrolü
if command -v pod &> /dev/null; then
    pod_version=$(pod --version)
    echo "✅ CocoaPods kuruldu: $pod_version"
else
    echo "⚠️  CocoaPods PATH'te bulunamadı"
    echo "   Terminal'i yeniden başlatın veya:"
    echo "   export PATH=\"\$HOME/.gem/ruby/*/bin:\$PATH\""
fi

echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
echo "📝 Önemli: Terminal'i yeniden başlatın veya:"
echo "   source ~/.zshrc"
echo ""
echo "🚀 Sonra build script'ini çalıştırın:"
echo "   bash FIX_BUILD_AND_RETRY.sh"
