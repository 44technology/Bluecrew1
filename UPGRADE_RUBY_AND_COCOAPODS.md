# Ruby Güncelleme ve CocoaPods Kurulumu

## Sorun
Ruby versiyonu çok eski (2.6.10). CocoaPods Ruby 3.0+ gerektiriyor.

## Çözüm 1: rbenv ile Ruby Kurulumu (ÖNERİLEN)

### Adım 1: rbenv Kurulumu
```bash
# rbenv kur
brew install rbenv ruby-build

# PATH'e ekle
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
source ~/.zshrc
```

### Adım 2: Ruby 3.x Kurulumu
```bash
# Ruby 3.3.x kur (en son stabil)
rbenv install 3.3.0

# Global olarak ayarla
rbenv global 3.3.0

# Versiyonu kontrol et
ruby --version  # 3.3.0 görünmeli
```

### Adım 3: CocoaPods Kurulumu
```bash
# CocoaPods kur
gem install cocoapods

# Repo setup
pod setup
```

## Çözüm 2: Homebrew ile Ruby (Eğer Homebrew Kuruluysa)

```bash
# Homebrew kur (eğer yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Ruby kur
brew install ruby

# PATH'e ekle
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# CocoaPods kur
gem install cocoapods
pod setup
```

## Çözüm 3: Eski CocoaPods Versiyonu (Geçici Çözüm)

Eğer Ruby güncellemek istemiyorsanız:

```bash
# Eski CocoaPods versiyonu kur
sudo gem install cocoapods -v 1.11.3

# Kontrol et
pod --version
```

**Not:** Bu geçici bir çözümdür, bazı paketlerle uyumsuzluk olabilir.

## Çözüm 4: EAS Build Kullan (CocoaPods Gerektirmez)

EAS Cloud Build kullanırsanız CocoaPods lokal olarak gerekmez:

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# Sadece prebuild yap (CocoaPods gerektirmez)
npx expo prebuild --platform ios --clean

# EAS Cloud Build (CocoaPods cloud'da kurulur)
export PATH=~/.npm-global/bin:$PATH
eas build --platform ios --profile production
```

## Önerilen Yöntem

**En Kolay:** EAS Cloud Build kullanın (Çözüm 4)
- CocoaPods lokal kurulum gerektirmez
- Cloud'da otomatik kurulur
- Daha az sorun

**En İyi:** rbenv ile Ruby 3.x kurun (Çözüm 1)
- Modern Ruby versiyonu
- CocoaPods ile uyumlu
- Gelecekteki projeler için hazır
