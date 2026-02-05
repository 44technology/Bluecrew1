#!/bin/bash

# Ruby ve CocoaPods Kurulum Scripti

set -e

echo "🔧 Ruby ve CocoaPods Kurulumu Başlatılıyor..."
echo ""

# Mevcut Ruby versiyonu
CURRENT_RUBY=$(ruby --version 2>/dev/null | awk '{print $2}' || echo "0.0.0")
echo "📊 Mevcut Ruby: $CURRENT_RUBY"
echo ""

# Ruby 3.0+ kontrolü
RUBY_MAJOR=$(echo $CURRENT_RUBY | cut -d. -f1)
if [ "$RUBY_MAJOR" -ge 3 ]; then
    echo "✅ Ruby versiyonu yeterli (3.0+)"
else
    echo "⚠️  Ruby 3.0+ gerekiyor, güncelleniyor..."
    echo ""
    
    # Homebrew kontrolü
    if ! command -v brew &> /dev/null; then
        echo "📦 Homebrew kuruluyor..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # PATH'e ekle
        if [[ $(uname -m) == "arm64" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
            eval "$(/opt/homebrew/bin/brew shellenv)"
        else
            echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
            eval "$(/usr/local/bin/brew shellenv)"
        fi
        echo "✅ Homebrew kuruldu"
    else
        echo "✅ Homebrew zaten kurulu"
    fi
    
    echo ""
    echo "💎 Ruby kuruluyor (bu biraz zaman alabilir)..."
    brew install ruby
    
    # PATH'e ekle
    if [[ $(uname -m) == "arm64" ]]; then
        RUBY_PATH="/opt/homebrew/opt/ruby/bin"
    else
        RUBY_PATH="/usr/local/opt/ruby/bin"
    fi
    
    if ! grep -q "$RUBY_PATH" ~/.zshrc 2>/dev/null; then
        echo "export PATH=\"$RUBY_PATH:\$PATH\"" >> ~/.zshrc
    fi
    export PATH="$RUBY_PATH:$PATH"
    
    echo ""
    echo "✅ Ruby kuruldu: $(ruby --version)"
fi

echo ""

# CocoaPods kontrolü
if command -v pod &> /dev/null; then
    echo "✅ CocoaPods zaten kurulu: $(pod --version)"
    exit 0
fi

echo "📦 CocoaPods kuruluyor..."
gem install cocoapods

echo ""
echo "✅ CocoaPods kuruldu: $(pod --version)"
echo ""
echo "🎉 Kurulum tamamlandı!"
echo ""
echo "📋 Sonraki adım:"
echo "   cd ios && pod install"
