# iOS Build Hatası Çözüm Rehberi

## Build Loglarını Görüntüleme

Detaylı hata mesajlarını görmek için:

```bash
# Son build'i listele
eas build:list --platform ios --limit 1

# Build ID'yi alıp logları görüntüle
eas build:view [BUILD_ID] --logs
```

## Yaygın Hatalar ve Çözümleri

### 1. GoogleService-Info.plist Hatası

**Hata:** `GoogleService-Info.plist not found` veya `Unable to find GoogleService-Info.plist`

**Çözüm:**
```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# GoogleService-Info.plist'in ios/BlueCrew/ altında olduğundan emin ol
cp GoogleService-Info.plist ios/BlueCrew/GoogleService-Info.plist

# Prebuild tekrar yap
npx expo prebuild --platform ios --clean
```

### 2. CocoaPods Bağımlılık Hatası

**Hata:** `Pod install failed` veya `Unable to find a specification`

**Çözüm:**
```bash
cd /Users/danielamartinez/Documents/bluecrew1/project/ios

# CocoaPods cache temizle
pod cache clean --all
rm -rf ~/Library/Caches/CocoaPods
rm -rf Pods
rm Podfile.lock

# Tekrar kur
pod install --repo-update
```

### 3. New Architecture (RCTNewArchEnabled) Hatası

**Hata:** React Native New Architecture ile ilgili hatalar

**Çözüm 1: New Architecture'ı Kapat**
`app.json` dosyasını düzenle:
```json
{
  "expo": {
    "ios": {
      "newArchEnabled": false
    }
  }
}
```

Sonra:
```bash
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
```

**Çözüm 2: New Architecture Desteğini Kontrol Et**
Bazı paketler henüz New Architecture'ı desteklemiyor olabilir.

### 4. Xcode Versiyonu Uyumsuzluğu

**Hata:** `Xcode version mismatch` veya `Unsupported Xcode version`

**Çözüm:**
```bash
# Xcode versiyonunu kontrol et
xcodebuild -version

# EAS build için minimum Xcode 14+ gereklidir
# Eğer eski versiyon varsa, EAS Cloud Build kullanın
eas build --platform ios --profile production
```

### 5. Certificate/Provisioning Profile Hatası

**Hata:** `Code signing failed` veya `No provisioning profile found`

**Çözüm:**
EAS otomatik olarak yönetir, ancak manuel kontrol için:
```bash
eas credentials
```

### 6. React Native Versiyonu Uyumsuzluğu

**Hata:** Paket uyumsuzlukları

**Çözüm:**
```bash
# Node modules temizle
rm -rf node_modules
npm install

# iOS native kodları temizle ve yeniden oluştur
rm -rf ios
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
```

### 7. Build Configuration Hatası

**Hata:** `Build configuration not found` veya `Scheme not found`

**Çözüm:**
```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# Temiz prebuild
npx expo prebuild --platform ios --clean

# Pod install
cd ios
pod install
cd ..

# Xcode workspace'i kontrol et
open ios/BlueCrew.xcworkspace
```

## Genel Sorun Giderme Adımları

### Adım 1: Temiz Build

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# 1. Node modules temizle
rm -rf node_modules
npm install

# 2. iOS klasörünü temizle
rm -rf ios

# 3. Prebuild yap
npx expo prebuild --platform ios --clean

# 4. Pod install
cd ios
pod install
cd ..

# 5. Build tekrar dene
eas build --platform ios --profile production
```

### Adım 2: Lokal Build ile Test

Cloud build'de hata alıyorsanız, lokal build ile test edin:

```bash
# CocoaPods kur (eğer yoksa)
sudo gem install cocoapods

# Lokal build
eas build --platform ios --local --profile production
```

### Adım 3: Xcode ile Direkt Build

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# Prebuild
npx expo prebuild --platform ios

# Pod install
cd ios && pod install && cd ..

# Xcode aç
open ios/BlueCrew.xcworkspace
```

Xcode'da:
1. Product > Clean Build Folder (⇧⌘K)
2. Product > Build (⌘B)
3. Hataları kontrol et

## Build Loglarını Paylaşma

Detaylı hata mesajı için:

```bash
# Build ID'yi al
eas build:list --platform ios --limit 1

# Logları görüntüle
eas build:view [BUILD_ID] --logs > build-logs.txt

# Logları incele
cat build-logs.txt | grep -i error
```

## Hızlı Çözüm (En Yaygın)

Çoğu durumda şu adımlar sorunu çözer:

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# 1. Temizle
rm -rf node_modules ios
npm install

# 2. Prebuild
npx expo prebuild --platform ios --clean

# 3. Pod install
cd ios
pod install
cd ..

# 4. Build
eas build --platform ios --profile production
```

## Yardım

Eğer hala sorun devam ederse:
1. Build loglarını paylaşın: `eas build:view [BUILD_ID] --logs`
2. Xcode versiyonunu kontrol edin: `xcodebuild -version`
3. Node versiyonunu kontrol edin: `node --version`
4. Expo versiyonunu kontrol edin: `npx expo --version`
