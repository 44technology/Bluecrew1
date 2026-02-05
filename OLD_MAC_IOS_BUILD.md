# Eski Mac için iOS Build Rehberi

macOS 12.7.2 (Monterey) için iOS build yapma yöntemleri.

## Durum
- macOS: 12.7.2 (Monterey)
- Yeni Xcode: macOS 15.6+ gerektiriyor ❌
- Çözüm: Eski Xcode versiyonu veya EAS Cloud Build

## Yöntem 1: Eski Xcode Kurulumu (Önerilen)

### 1. Uyumlu Xcode Versiyonu
macOS 12.7.2 için **Xcode 14.x** uyumludur.

### 2. Xcode 14.x İndirme
1. Apple Developer hesabınıza giriş yapın: https://developer.apple.com/download
2. "More Downloads" bölümüne gidin
3. "Xcode 14.3" veya "Xcode 14.2" indirin
4. İndirilen `.xip` dosyasını çift tıklayarak açın
5. Xcode'u Applications klasörüne sürükleyin

### 3. Command Line Tools
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

### 4. CocoaPods Kurulumu
```bash
sudo gem install cocoapods
```

### 5. Build
```bash
cd /Users/aliakda/Desktop/bluecrew1/project/ios
pod install
cd ..
open ios/BlueCrew.xcworkspace
```

## Yöntem 2: EAS Cloud Build (Daha Kolay, Yavaş)

EAS cloud build kullanarak lokal Xcode gerektirmeden build alabilirsiniz:

### 1. Build Başlatma
```bash
cd /Users/aliakda/Desktop/bluecrew1/project
eas build --platform ios --profile production
```

### 2. Build Süreci
- Cloud'da build yapılır (15-30 dakika)
- Mac'inizde Xcode gerekmez
- Sadece internet bağlantısı yeterli

### 3. Build Tamamlandıktan Sonra
- QR kod ile test edebilirsiniz
- veya App Store'a submit edebilirsiniz

## Yöntem 3: Expo Go ile Test (Hızlı Test)

Production build yerine Expo Go ile test edebilirsiniz:

```bash
cd /Users/aliakda/Desktop/bluecrew1/project
npm run dev
```

Sonra iPhone'unuzda Expo Go uygulamasını açıp QR kodu tarayın.

## Önerilen Yaklaşım

**Hızlı test için:**
- Expo Go kullanın (5 dakika)

**Production build için:**
1. **İlk seçenek:** EAS Cloud Build (kolay, yavaş)
2. **İkinci seçenek:** Xcode 14.x kur (zahmetli ama hızlı)

## EAS Cloud Build Hızlandırma İpuçları

1. **Build cache:** İlk build yavaş, sonrakiler hızlı
2. **Profile seçimi:** `preview` profile daha hızlı olabilir
3. **Gece build:** Daha az trafik olduğu için daha hızlı

## Xcode 14.x İndirme Linki

Apple Developer hesabınız varsa:
https://developer.apple.com/download/all/

Arama: "Xcode 14"

## Sorun Giderme

### Xcode Kurulumu Sorunları
```bash
# Xcode path kontrolü
xcode-select -p

# Xcode path ayarlama
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### CocoaPods Sorunları
```bash
# CocoaPods cache temizleme
pod cache clean --all
rm -rf ~/Library/Caches/CocoaPods
pod install
```
