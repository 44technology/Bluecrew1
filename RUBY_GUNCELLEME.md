# Ruby Güncelleme Rehberi

Ruby 2.6.10 çok eski. CocoaPods için Ruby 3.0+ gerekiyor.

## Yöntem 1: Homebrew ile Ruby Kurulumu (ÖNERİLEN)

### Adımlar:

```bash
# 1. Homebrew'i kur (eğer yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Homebrew'i PATH'e ekle (Apple Silicon Mac için)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

# 3. Ruby'yi kur
brew install ruby

# 4. PATH'e ekle
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

# 5. Kontrol et
ruby --version

# 6. CocoaPods'u kur
gem install cocoapods
```

## Yöntem 2: rbenv ile Ruby Kurulumu

```bash
# 1. rbenv'i kur
brew install rbenv ruby-build

# 2. rbenv'i PATH'e ekle
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
eval "$(rbenv init - zsh)"

# 3. Ruby 3.3.x LTS kur
rbenv install 3.3.6
rbenv global 3.3.6

# 4. Kontrol et
ruby --version

# 5. CocoaPods'u kur
gem install cocoapods
```

## Yöntem 3: Sistem Ruby ile Çalışma (Geçici Çözüm)

Eğer Ruby'yi güncelleyemiyorsanız, eski ffi versiyonunu kurun:

```bash
# Eski ffi versiyonunu kur
gem install ffi -v 1.17.3

# CocoaPods'u kur
gem install cocoapods
```

**Not:** Bu geçici bir çözümdür. Uzun vadede Ruby'yi güncellemek daha iyidir.

## Hızlı Kurulum Scripti

```bash
#!/bin/bash

# Ruby ve CocoaPods Kurulum Scripti

echo "🔧 Ruby ve CocoaPods Kurulumu"
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
fi

# Ruby kurulumu
echo "💎 Ruby kuruluyor..."
brew install ruby

# PATH'e ekle
if [[ $(uname -m) == "arm64" ]]; then
    RUBY_PATH="/opt/homebrew/opt/ruby/bin"
else
    RUBY_PATH="/usr/local/opt/ruby/bin"
fi

echo "export PATH=\"$RUBY_PATH:\$PATH\"" >> ~/.zshrc
export PATH="$RUBY_PATH:$PATH"

# Kontrol
echo ""
echo "✅ Ruby: $(ruby --version)"
echo ""

# CocoaPods kurulumu
echo "📦 CocoaPods kuruluyor..."
gem install cocoapods

echo ""
echo "✅ CocoaPods: $(pod --version)"
echo ""
echo "🎉 Kurulum tamamlandı!"
```

## Özet

1. **Homebrew kur** (yoksa)
2. **Ruby 3.x kur** (Homebrew ile)
3. **PATH'e ekle**
4. **CocoaPods kur**

## Sorun Giderme

### "Command not found: brew"
- Homebrew kurulumunu tamamlayın
- Terminal'i yeniden başlatın

### "Permission denied"
- Terminal'e Full Disk Access izni verin
- System Preferences > Security & Privacy > Privacy > Full Disk Access

### Ruby versiyonu değişmiyor
- Terminal'i kapatıp yeniden açın
- `source ~/.zshrc` komutunu çalıştırın
- `which ruby` ile hangi Ruby'nin kullanıldığını kontrol edin
