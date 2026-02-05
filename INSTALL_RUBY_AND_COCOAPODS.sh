#!/bin/bash

# Ruby ve CocoaPods Kurulum Scripti

set -e

echo "🔧 Ruby ve CocoaPods Kurulumu"
echo ""

# Mevcut Ruby versiyonu
current_ruby=$(ruby --version 2>&1 | awk '{print $2}')
echo "📋 Mevcut Ruby versiyonu: $current_ruby"

# Ruby 3.0+ kontrolü
if ruby -e "exit(RUBY_VERSION.to_f >= 3.0 ? 0 : 1)" 2>/dev/null; then
    echo "✅ Ruby versiyonu uygun (3.0+)"
    ruby_ok=true
else
    echo "⚠️  Ruby versiyonu eski, güncelleme gerekiyor"
    ruby_ok=false
fi

if [ "$ruby_ok" = false ]; then
    echo ""
    echo "Ruby güncelleme yöntemi seçin:"
    echo "1. rbenv ile Ruby 3.x kur (önerilen)"
    echo "2. Homebrew ile Ruby kur"
    echo "3. Eski CocoaPods versiyonu kur (geçici çözüm)"
    echo "4. EAS Cloud Build kullan (CocoaPods gerektirmez)"
    echo ""
    read -p "Seçiminiz (1/2/3/4) [4]: " choice
    choice=${choice:-4}
    
    case $choice in
        1)
            echo ""
            echo "📦 rbenv kurulumu..."
            if ! command -v brew &> /dev/null; then
                echo "❌ Homebrew bulunamadı!"
                echo "   Önce Homebrew kurun: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                exit 1
            fi
            
            brew install rbenv ruby-build
            
            # PATH'e ekle
            if ! grep -q 'rbenv' ~/.zshrc; then
                echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
                echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
            fi
            
            export PATH="$HOME/.rbenv/bin:$PATH"
            eval "$(rbenv init - zsh)"
            
            echo "📦 Ruby 3.3.0 kuruluyor..."
            rbenv install 3.3.0
            rbenv global 3.3.0
            
            # Yeni Ruby versiyonunu kullan
            eval "$(rbenv init - zsh)"
            ruby --version
            ;;
        2)
            echo ""
            echo "📦 Homebrew ile Ruby kurulumu..."
            if ! command -v brew &> /dev/null; then
                echo "❌ Homebrew bulunamadı!"
                echo "   Önce Homebrew kurun: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                exit 1
            fi
            
            brew install ruby
            
            if ! grep -q 'homebrew.*ruby' ~/.zshrc; then
                echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
            fi
            
            export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
            ruby --version
            ;;
        3)
            echo ""
            echo "📦 Eski CocoaPods versiyonu kuruluyor..."
            sudo gem install cocoapods -v 1.11.3
            pod --version
            exit 0
            ;;
        4)
            echo ""
            echo "✅ EAS Cloud Build kullanılacak"
            echo "   CocoaPods lokal kurulum gerektirmez"
            echo ""
            echo "Build başlatmak için:"
            echo "  export PATH=~/.npm-global/bin:\$PATH"
            echo "  eas build --platform ios --profile production"
            exit 0
            ;;
    esac
fi

# CocoaPods kurulumu
echo ""
echo "📦 CocoaPods kuruluyor..."
gem install cocoapods

# CocoaPods kontrolü
if command -v pod &> /dev/null; then
    pod_version=$(pod --version)
    echo "✅ CocoaPods kuruldu: $pod_version"
    
    echo ""
    echo "📚 CocoaPods repo setup yapılıyor..."
    echo "   Bu işlem birkaç dakika sürebilir..."
    pod setup || echo "⚠️  Repo setup atlandı (zaten kurulu olabilir)"
else
    echo "❌ CocoaPods kurulumu başarısız!"
    exit 1
fi

echo ""
echo "✅ Kurulum tamamlandı!"
echo "🚀 Şimdi build script'ini çalıştırabilirsiniz:"
echo "   bash FIX_BUILD_AND_RETRY.sh"
