#!/bin/bash

# CocoaPods Kurulum Scripti

echo "🔧 CocoaPods Kurulum Başlatılıyor..."
echo ""

# Ruby kontrolü
if ! command -v ruby &> /dev/null; then
    echo "❌ Ruby bulunamadı!"
    echo "Ruby kurmak için: brew install ruby"
    exit 1
fi

echo "✅ Ruby: $(ruby --version)"
echo ""

# CocoaPods kontrolü
if command -v pod &> /dev/null; then
    echo "✅ CocoaPods zaten kurulu: $(pod --version)"
    exit 0
fi

echo "📦 CocoaPods kuruluyor..."
echo ""

# Yöntem 1: Homebrew (eğer varsa)
if command -v brew &> /dev/null; then
    echo "🍺 Homebrew ile kurulum deneniyor..."
    brew install cocoapods
    if command -v pod &> /dev/null; then
        echo "✅ CocoaPods kuruldu: $(pod --version)"
        exit 0
    fi
fi

# Yöntem 2: Gem user install
echo "💎 Gem user install deneniyor..."
gem install cocoapods --user-install 2>/dev/null

if [ $? -eq 0 ]; then
    # PATH'e ekle
    RUBY_VERSION=$(ruby -e 'puts RUBY_VERSION[/\d+\.\d+/]' 2>/dev/null)
    if [ -n "$RUBY_VERSION" ]; then
        GEM_PATH="$HOME/.gem/ruby/$RUBY_VERSION/bin"
        export PATH="$GEM_PATH:$PATH"
        
        if command -v pod &> /dev/null; then
            echo "✅ CocoaPods kuruldu: $(pod --version)"
            echo ""
            echo "⚠️  PATH'e eklemek için şu komutu çalıştırın:"
            echo "export PATH=\"$GEM_PATH:\$PATH\""
            echo ""
            echo "Veya kalıcı olarak ~/.zshrc dosyanıza ekleyin:"
            echo "echo 'export PATH=\"$GEM_PATH:\$PATH\"' >> ~/.zshrc"
            exit 0
        fi
    fi
fi

# Yöntem 3: Sudo (son çare)
echo ""
echo "⚠️  Sudo izni gerekiyor. Manuel olarak şu komutu çalıştırın:"
echo "   sudo gem install cocoapods"
echo ""
echo "Veya Terminal'e 'Full Disk Access' izni verin:"
echo "System Preferences > Security & Privacy > Privacy > Full Disk Access"
echo ""

exit 1
