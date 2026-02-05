# Xcode'da iOS Build ve Simulator Test Rehberi

Bu rehber, Xcode'u kullanarak iOS uygulamasını build edip simulator'de test etmek için adımları içerir.

## Ön Gereksinimler

### 1. Node.js (Metro Bundler için gerekli)
Node.js kurulu değilse:

**Homebrew ile (önerilen):**
```bash
brew install node
```

**NVM ile:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install --lts
```

**Kontrol:**
```bash
node --version
npm --version
```

### 2. CocoaPods
```bash
sudo gem install cocoapods
```

### 3. Xcode
App Store'dan Xcode'u kurun ve açın (lisans sözleşmesini kabul edin).

## Hızlı Başlangıç (Otomatik)

### Yöntem 1: Expo Script (Önerilen)
```bash
# 1. Node.js kur (yukarıdaki adımlardan biriyle)
# 2. Bağımlılıkları yükle
npm install

# 3. iOS bağımlılıklarını yükle
cd ios
pod install
cd ..

# 4. Build ve simulator'de çalıştır
npm run ios
# veya
npx expo run:ios
```

Bu komut:
- iOS uygulamasını build eder
- Metro bundler'ı başlatır
- Simulator'ü açar ve uygulamayı yükler

## Xcode ile Manuel Build

### 1. Xcode Workspace'i Aç
```bash
open -a Xcode ios/BlueCrew.xcworkspace
```

**ÖNEMLİ:** `.xcworkspace` dosyasını açın, `.xcodeproj` değil!

### 2. Simulator Seçimi
Xcode'da üst kısımda:
- Sol tarafta scheme seçici: **BlueCrew** seçili olmalı
- Sağ tarafta device seçici: Bir iPhone simulator seçin (örn: iPhone 15, iPhone 15 Pro)

### 3. Build ve Run
- **Cmd + R** tuşlarına basın
- veya üst menüden: **Product > Run**

### 4. Metro Bundler'ı Başlat
Xcode build tamamlandıktan sonra, uygulama simulator'de açılır ama JavaScript bundle yüklenmez. Metro bundler'ı ayrı bir terminal'de başlatın:

```bash
npm start
# veya
npx expo start
```

Metro bundler başladıktan sonra simulator'daki uygulama otomatik olarak yenilenecektir.

## Sorun Giderme

### Simulator Bağlantı Sorunları
Eğer simulator bağlantı hataları alıyorsanız:

```bash
# Simulator servisini yeniden başlat
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService
sudo killall -9 com.apple.iphonesimulator

# Xcode'u kapat ve yeniden aç
```

### CocoaPods Sorunları
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Build Hataları
1. Xcode'da: **Product > Clean Build Folder** (Shift + Cmd + K)
2. Derived Data'yı temizle:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
3. Tekrar build edin

### Metro Bundler Bağlantı Sorunları
Eğer uygulama Metro bundler'a bağlanamıyorsa:

1. Metro bundler'ın çalıştığından emin olun
2. Simulator'de: **Device > Shake** (Cmd + Ctrl + Z)
3. "Configure Bundler" seçeneğini seçin
4. Metro bundler'ın IP adresini girin (genelde `localhost:8081`)

## Alternatif: Script Kullanımı

Projede hazır script'ler var:

```bash
# Node.js kurulum yardımcısı
./setup-node-and-build.sh

# Otomatik build ve test
./build-and-test-ios.sh
```

## Önemli Notlar

1. **İlk Build:** İlk build 5-10 dakika sürebilir (bağımlılıklar derleniyor)
2. **Metro Bundler:** Her zaman çalışır durumda olmalı (development için)
3. **Hot Reload:** Metro bundler çalışırken kod değişiklikleri otomatik yansır
4. **Simulator Performansı:** İlk açılış yavaş olabilir, sonraki açılışlar hızlıdır

## Hızlı Komutlar Özeti

```bash
# Tüm setup (ilk kez)
npm install
cd ios && pod install && cd ..
npm run ios

# Sadece build (Xcode açıkken)
# Xcode'da: Cmd + R

# Metro bundler (ayrı terminal)
npm start

# Temiz build
cd ios
xcodebuild clean -workspace BlueCrew.xcworkspace -scheme BlueCrew
cd ..
npm run ios
```
