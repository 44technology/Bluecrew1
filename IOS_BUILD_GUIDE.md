# iOS App Build Rehberi

Bu rehber, BlueCrew uygulamasını iOS için build etmek için gerekli adımları içerir.

## Ön Gereksinimler

### 1. Apple Developer Hesabı
- Apple Developer Program üyeliği gereklidir ($99/yıl)
- Apple ID ile giriş yapın: https://developer.apple.com

### 2. Gerekli Araçlar
- Node.js 18+ (zaten kurulu)
- EAS CLI (Expo Application Services)
- Xcode (sadece lokal build için gerekli, EAS cloud build kullanıyorsanız gerekmez)

## Kurulum Adımları

### 1. EAS CLI Kurulumu
```bash
npm install -g eas-cli
```

### 2. Expo Hesabına Giriş
```bash
eas login
```
Expo hesabınız yoksa: https://expo.dev adresinden ücretsiz hesap oluşturun.

### 3. Projeyi EAS'a Bağlama
```bash
cd project
eas build:configure
```

## iOS Build Yapılandırması

### 1. app.json Kontrolü
- `bundleIdentifier`: `com.bluecrew.app` (zaten ayarlı)
- `googleServicesFile`: `./GoogleService-Info.plist` (zaten ayarlı)

### 2. EAS Build Profili
`eas.json` dosyası zaten yapılandırılmış. İsterseniz iOS'a özel ayarlar ekleyebilirsiniz:

```json
{
  "build": {
    "production": {
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      }
    }
  }
}
```

## Build Komutları

### 1. Development Build (Test için)
```bash
npm run build:ios -- --profile development
```

### 2. Preview Build (TestFlight öncesi)
```bash
npm run build:ios -- --profile preview
```

### 3. Production Build (App Store için)
```bash
npm run build:ios -- --profile production
```

veya direkt:
```bash
eas build --platform ios --profile production
```

## Build Süreci

1. **Build başlatıldığında:**
   - EAS cloud'da build başlar
   - İlk build 15-30 dakika sürebilir
   - Sonraki build'ler daha hızlı olur (cache sayesinde)

2. **Apple Developer Credentials:**
   - İlk build'de Apple Developer hesabınıza giriş yapmanız istenecek
   - EAS, credentials'ları güvenli şekilde saklar

3. **Build tamamlandığında:**
   - Build URL'i gösterilir
   - QR kod ile iOS cihazınızdan test edebilirsiniz
   - veya App Store'a submit edebilirsiniz

## App Store'a Yükleme

### 1. Build'i Submit Etme
```bash
eas submit --platform ios
```

### 2. Manuel Submit
- Build tamamlandıktan sonra `.ipa` dosyasını indirin
- App Store Connect'e giriş yapın: https://appstoreconnect.apple.com
- "My Apps" > "+" > "New App"
- Build'i yükleyin ve review için submit edin

## Önemli Notlar

1. **Bundle Identifier:**
   - `com.bluecrew.app` benzersiz olmalı
   - Apple Developer hesabınızda bu bundle ID'yi register etmeniz gerekebilir

2. **Certificates & Profiles:**
   - EAS otomatik olarak yönetir
   - Manuel müdahale genelde gerekmez

3. **GoogleService-Info.plist:**
   - Firebase için gerekli
   - Dosya zaten projede mevcut

4. **Version & Build Number:**
   - `app.json`'da `version` güncellenmeli
   - EAS otomatik build number artırır (production profile'da)

## Sorun Giderme

### Build Hataları
```bash
eas build:list
eas build:view [BUILD_ID]
```

### Credentials Sorunları
```bash
eas credentials
```

### Log Kontrolü
Build sırasında logları görmek için:
```bash
eas build:view [BUILD_ID] --logs
```

## Hızlı Başlangıç

En hızlı şekilde iOS build için:

```bash
# 1. EAS CLI kur
npm install -g eas-cli

# 2. Giriş yap
eas login

# 3. Build başlat
cd project
eas build --platform ios --profile production
```

Build tamamlandıktan sonra:
```bash
# App Store'a submit et
eas submit --platform ios
```

## Ek Kaynaklar

- EAS Dokümantasyon: https://docs.expo.dev/build/introduction/
- Apple Developer: https://developer.apple.com
- Expo Dokümantasyon: https://docs.expo.dev/
