# iOS Build Kurulum Rehberi

## ⚠️ Ön Gereksinimler

iOS build yapmak için aşağıdakilerin kurulu olması gerekiyor:

### 1. Node.js Kurulumu (GEREKLİ)

Node.js şu anda sisteminizde bulunamadı. Aşağıdaki yöntemlerden biriyle kurabilirsiniz:

#### Seçenek A: Homebrew ile (Önerilen)
```bash
# Önce Homebrew kurun (eğer yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Sonra Node.js kurun
brew install node
```

#### Seçenek B: NVM ile (Node Version Manager)
```bash
# NVM kurun
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Terminal'i yeniden başlatın veya:
source ~/.zshrc

# Node.js'in en son LTS versiyonunu kurun
nvm install --lts
nvm use --lts
```

#### Seçenek C: Resmi Installer
1. https://nodejs.org/ adresine gidin
2. LTS versiyonunu indirin ve kurun

#### Kurulumu Doğrulama
```bash
node --version  # v18.x.x veya üzeri olmalı
npm --version   # 9.x.x veya üzeri olmalı
```

### 2. EAS CLI Kurulumu

Node.js kurulduktan sonra:
```bash
npm install -g eas-cli
eas login
```

### 3. CocoaPods Kurulumu (Lokal Build için)

```bash
sudo gem install cocoapods
```

## 🚀 Build İşlemi

### Yöntem 1: EAS Cloud Build (Kolay, Yavaş)

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project
eas build --platform ios --profile production
```

**Avantajlar:**
- ✅ Mac gerekmez (cloud'da build yapılır)
- ✅ Kolay kurulum
- ✅ Otomatik certificate yönetimi

**Dezavantajlar:**
- ❌ 15-30 dakika sürebilir
- ❌ İnternet bağlantısı gerekir

### Yöntem 2: EAS Lokal Build (Hızlı, Mac Gerekir)

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# iOS native kodları oluştur/güncelle
npx expo prebuild --platform ios

# CocoaPods bağımlılıklarını yükle
cd ios
pod install
cd ..

# Lokal build
eas build --platform ios --local --profile production
```

**Avantajlar:**
- ✅ Çok daha hızlı (5-10 dakika)
- ✅ İnternet bağlantısına bağlı değil
- ✅ EAS yapılandırmasını kullanır

### Yöntem 3: Xcode ile Direkt Build (En Hızlı)

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# iOS native kodları oluştur/güncelle
npx expo prebuild --platform ios

# CocoaPods bağımlılıklarını yükle
cd ios
pod install
cd ..

# Xcode'u aç
open ios/BlueCrew.xcworkspace
```

Xcode'da:
1. Sol üstten cihaz/simülatör seçin
2. **Product > Build** (⌘B) - Test için
3. **Product > Archive** - App Store için

## 📋 Hızlı Başlangıç (Adım Adım)

1. **Node.js kur:**
   ```bash
   brew install node
   # veya
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.zshrc
   nvm install --lts
   ```

2. **EAS CLI kur:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

3. **CocoaPods kur (lokal build için):**
   ```bash
   sudo gem install cocoapods
   ```

4. **Build başlat:**
   ```bash
   cd /Users/danielamartinez/Documents/bluecrew1/project
   eas build --platform ios --profile production
   ```

## 🔍 Sorun Giderme

### Node.js bulunamıyor
```bash
# PATH'e ekleyin
export PATH="/usr/local/bin:$PATH"
# veya
export PATH="$HOME/.nvm/versions/node/$(nvm version)/bin:$PATH"
```

### CocoaPods hataları
```bash
cd ios
pod deintegrate
pod install
```

### Prebuild hataları
```bash
npx expo prebuild --clean --platform ios
```

## 📞 Yardım

- EAS Dokümantasyon: https://docs.expo.dev/build/introduction/
- Expo Dokümantasyon: https://docs.expo.dev/
