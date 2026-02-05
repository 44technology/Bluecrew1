# Lokal iOS Build Rehberi (Mac Üzerinde)

EAS cloud build yavaş olduğu için Mac'inizde lokal build yapabilirsiniz. Bu çok daha hızlıdır!

## Ön Gereksinimler

✅ Mac (zaten var)
✅ Xcode kurulu (zaten var)
✅ Node.js 18+ (zaten kurulu)
✅ CocoaPods (iOS bağımlılıkları için)

## Hızlı Başlangıç

### 1. CocoaPods Kurulumu (İlk kez)
```bash
sudo gem install cocoapods
```

### 2. iOS Native Kodları Oluşturma
```bash
cd /Users/aliakda/Desktop/bluecrew1/project
npx expo prebuild --platform ios
```

Bu komut:
- `ios/` klasörünü oluşturur
- Native iOS projesini hazırlar
- Podfile oluşturur

### 3. CocoaPods Bağımlılıklarını Yükleme
```bash
cd ios
pod install
cd ..
```

### 4. Xcode ile Build

**Seçenek A: Xcode GUI ile (Önerilen)**
```bash
open ios/bluecrew.xcworkspace
```

Xcode'da:
1. Sol üstten cihaz/simülatör seçin
2. Product > Build (⌘B) - Test için
3. Product > Archive - App Store için

**Seçenek B: Komut Satırı ile**
```bash
# Simülatör için build
xcodebuild -workspace ios/bluecrew.xcworkspace \
  -scheme bluecrew \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath ios/build

# Gerçek cihaz için build
xcodebuild -workspace ios/bluecrew.xcworkspace \
  -scheme bluecrew \
  -configuration Release \
  -sdk iphoneos \
  -archivePath ios/build/bluecrew.xcarchive \
  archive
```

## EAS Build ile Lokal Build

EAS CLI ile de lokal build yapabilirsiniz:

```bash
# Lokal build (Mac'inizde)
eas build --platform ios --local

# Veya belirli bir profile ile
eas build --platform ios --local --profile production
```

Bu yöntem:
- ✅ EAS yapılandırmasını kullanır
- ✅ Lokal Mac'inizde build yapar
- ✅ Cloud'dan çok daha hızlıdır
- ✅ İnternet bağlantısına bağlı değildir

## Hız Karşılaştırması

- **EAS Cloud (Free Tier)**: 15-30 dakika ⏱️
- **EAS Lokal Build**: 5-10 dakika ⚡
- **Xcode Direkt Build**: 3-5 dakika 🚀

## Sorun Giderme

### CocoaPods Hataları
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Prebuild Hataları
```bash
# Temiz prebuild
npx expo prebuild --clean --platform ios
```

### Xcode Build Hataları
1. Xcode'u kapatın
2. `ios/` klasörünü silin
3. `npx expo prebuild --platform ios` tekrar çalıştırın
4. `pod install` yapın

## App Store'a Yükleme

Lokal build yaptıktan sonra:

### 1. Archive Oluşturma (Xcode)
- Product > Archive
- Organizer penceresi açılır

### 2. App Store'a Yükleme
- Organizer'da "Distribute App" butonuna tıklayın
- "App Store Connect" seçin
- Yükleme işlemini tamamlayın

### Veya EAS Submit ile
```bash
eas submit --platform ios --latest
```

## Önerilen Yöntem

**En Hızlı ve Kolay:**
```bash
# 1. Prebuild (sadece ilk kez veya değişiklik varsa)
npx expo prebuild --platform ios

# 2. Pod install
cd ios && pod install && cd ..

# 3. EAS lokal build
eas build --platform ios --local --profile production
```

Bu yöntem:
- ✅ EAS yapılandırmasını kullanır
- ✅ Lokal Mac'inizde çalışır
- ✅ Cloud'dan 3-5x daha hızlıdır
- ✅ Kolay ve güvenilirdir
