# Xcode 14.x Kurulum Rehberi (macOS 12.7.2)

## Adım 1: Xcode 14.x İndirme

### 1.1 Apple Developer Hesabına Giriş
1. Tarayıcınızda şu adrese gidin: https://developer.apple.com/download
2. Apple ID ile giriş yapın
3. Eğer hesabınız yoksa: https://developer.apple.com/programs/ (ücretsiz hesap yeterli, $99/yıl sadece App Store yayınlamak için)

### 1.2 Xcode 14.x İndirme
1. "More Downloads" veya "Downloads" sekmesine gidin
2. Arama kutusuna "Xcode 14" yazın
3. **Xcode 14.3.1** veya **Xcode 14.2** seçin (macOS 12.7.2 ile uyumlu)
4. İndirme butonuna tıklayın
5. `.xip` dosyası indirilecek (yaklaşık 10-12 GB)

### 1.3 Xcode Kurulumu
1. İndirilen `.xip` dosyasını bulun (genelde Downloads klasöründe)
2. Çift tıklayarak açın (otomatik açılır)
3. Açılan `Xcode.app` dosyasını `/Applications` klasörüne sürükleyin
4. Kurulum tamamlanana kadar bekleyin (5-10 dakika)

## Adım 2: Xcode Yapılandırması

### 2.1 Xcode'u İlk Açış
1. Applications klasöründen Xcode'u açın
2. "Get Started" butonuna tıklayın
3. Lisans sözleşmesini kabul edin
4. Additional Components kurulumunu tamamlayın (otomatik başlar)

### 2.2 Command Line Tools Ayarlama
Terminal'de şu komutları çalıştırın:

```bash
# Xcode path'ini ayarla
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Lisansı kabul et
sudo xcodebuild -license accept

# Versiyonu kontrol et
xcodebuild -version
```

Çıktı şöyle olmalı:
```
Xcode 14.3.1
Build version 14E300c
```

## Adım 3: CocoaPods Kurulumu

```bash
# CocoaPods kur
sudo gem install cocoapods

# Versiyonu kontrol et
pod --version
```

## Adım 4: iOS Projesi Build

### 4.1 Pod Install
```bash
cd /Users/aliakda/Desktop/bluecrew1/project/ios
pod install
```

Bu işlem 5-10 dakika sürebilir (ilk kez).

### 4.2 Xcode Workspace Açma
```bash
cd /Users/aliakda/Desktop/bluecrew1/project
open ios/BlueCrew.xcworkspace
```

**ÖNEMLİ:** `.xcodeproj` değil, `.xcworkspace` açmalısınız!

### 4.3 Xcode'da Build

1. **Cihaz/Simülatör Seçimi:**
   - Sol üstteki cihaz seçici menüsünden bir iOS simülatör veya gerçek cihaz seçin
   - İlk kez simülatör kullanıyorsanız: Xcode > Settings > Platforms > iOS > Download

2. **Build (Test için):**
   - Product > Build (⌘B)
   - veya sol üstteki Play butonuna tıklayın

3. **Archive (App Store için):**
   - Product > Archive
   - Archive tamamlandıktan sonra Organizer penceresi açılır
   - "Distribute App" butonuna tıklayın
   - "App Store Connect" seçin ve yükleme işlemini tamamlayın

## Sorun Giderme

### Xcode Açılmıyor
```bash
# Xcode'u zorla aç
sudo spctl --master-disable
xattr -cr /Applications/Xcode.app
```

### Command Line Tools Hatası
```bash
# Path kontrolü
xcode-select -p

# Path ayarlama
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### CocoaPods Hatası
```bash
# CocoaPods cache temizleme
pod cache clean --all
rm -rf ~/Library/Caches/CocoaPods
cd /Users/aliakda/Desktop/bluecrew1/project/ios
pod deintegrate
pod install
```

### Build Hatası
1. Xcode'u kapatın
2. `ios/` klasörünü silin
3. Prebuild tekrar yapın:
```bash
cd /Users/aliakda/Desktop/bluecrew1/project
npx expo prebuild --platform ios --clean
cd ios
pod install
```

## Hızlı Komutlar Özeti

```bash
# 1. Xcode path ayarla
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept

# 2. CocoaPods kur
sudo gem install cocoapods

# 3. Pod install
cd /Users/aliakda/Desktop/bluecrew1/project/ios
pod install

# 4. Xcode aç
cd /Users/aliakda/Desktop/bluecrew1/project
open ios/BlueCrew.xcworkspace
```

## Xcode 14.x İndirme Linkleri

**Doğrudan link (Apple Developer hesabı gerekli):**
- Xcode 14.3.1: https://developer.apple.com/download/all/?q=xcode%2014.3
- Xcode 14.2: https://developer.apple.com/download/all/?q=xcode%2014.2

**Alternatif:**
1. https://developer.apple.com/download
2. "More Downloads" sekmesi
3. Arama: "Xcode 14"
4. macOS 12 uyumlu versiyonu seçin

## Notlar

- Xcode 14.x macOS 12.7.2 ile tam uyumludur
- İndirme boyutu: ~10-12 GB
- Kurulum süresi: 10-20 dakika
- İlk build: 5-10 dakika
- Sonraki build'ler: 2-5 dakika
