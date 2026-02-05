# Hızlı Çözüm: Ruby ve CocoaPods Kurulumu

Ruby 2.6.10 çok eski. CocoaPods için Ruby 3.0+ gerekiyor.

## Adım Adım Çözüm

### 1. Homebrew Kurulumu

Terminal'de şu komutu çalıştırın:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Kurulum sırasında şifre istenebilir. Kurulum tamamlandıktan sonra:

```bash
# Apple Silicon Mac için
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

# Intel Mac için (eski Mac'ler)
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/usr/local/bin/brew shellenv)"
```

### 2. Ruby Kurulumu

```bash
# Ruby'yi kur
brew install ruby

# PATH'e ekle (Apple Silicon Mac için)
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

# PATH'e ekle (Intel Mac için)
# echo 'export PATH="/usr/local/opt/ruby/bin:$PATH"' >> ~/.zshrc
# export PATH="/usr/local/opt/ruby/bin:$PATH"

# Terminal'i yeniden başlat veya:
source ~/.zshrc

# Kontrol et
ruby --version
```

Ruby 3.x versiyonu görünmeli.

### 3. CocoaPods Kurulumu

```bash
# CocoaPods'u kur
gem install cocoapods

# Kontrol et
pod --version
```

### 4. iOS Bağımlılıklarını Yükle

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project/ios
pod install
```

## Tek Komutla (Script)

Eğer script'i çalıştırmak isterseniz:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
bash kur-ruby-ve-cocoapods.sh
```

## Özet

1. ✅ Homebrew kur
2. ✅ Ruby 3.x kur (Homebrew ile)
3. ✅ PATH'e ekle
4. ✅ CocoaPods kur
5. ✅ `pod install` çalıştır

## Sorun Giderme

### "Command not found: brew"
- Homebrew kurulumunu tamamlayın
- Terminal'i yeniden başlatın

### Ruby versiyonu değişmiyor
```bash
# Hangi Ruby kullanılıyor?
which ruby

# PATH'i kontrol et
echo $PATH

# Terminal'i kapatıp yeniden aç
```

### "Permission denied"
- Terminal'e Full Disk Access izni verin
- System Settings > Privacy & Security > Full Disk Access
