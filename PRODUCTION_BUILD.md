# Production build – App Store / TestFlight

Bu rehber, Blue Crew uygulamasının **production** (release) build’ini alıp TestFlight / App Store’a hazırlamak için kullanılır.

## EAS’a göndermeden önce yerelde production build (test)

Release (production) davranışını **EAS’ta build almadan önce** kendi makinenizde denemek için:

### iOS (Mac + Xcode gerekir)

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npm run ios:release
```

veya:

```bash
npx expo run:ios --configuration Release
```

- **Nerede çalışır:** Mac’te; Xcode ve iOS Simulator veya fiziksel iPhone (USB) gerekir.
- **Ne yapar:** Projeyi Release konfigürasyonuyla derler, optimizasyonlar ve production ayarları açık olur (dev menüsü yok, daha hızlı).
- **Simulator:** Komut genelde varsayılan simülatörde açar. Belirli cihaz için:  
  `npx expo run:ios --configuration Release --device "iPhone 16"`

### Android

```bash
npx expo run:android --variant release
```

- **Nerede çalışır:** Android Studio / emulator kurulu bir makinede veya USB ile bağlı Android cihazda.

### Web (production çıktı)

```bash
npm run build:web
```

- **Nerede çalışır:** `dist/` (veya export edilen klasör) çıkar; bunu herhangi bir web sunucusunda (Netlify, Vercel, vs.) yayınlayarak production gibi test edebilirsiniz.

---

## Ön koşullar

- [Expo hesabı](https://expo.dev) (proje `44network` / EAS projectId tanımlı)
- **iOS:** Apple Developer Program üyeliği + App Store Connect’te uygulama kayıtlı
- Proje dizininde: `eas.json` ve `app.json` güncel

## 1. EAS’e giriş

EAS CLI yüklü değilse `npx` ile çalıştırın (global kurulum gerekmez):

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx eas-cli login
```

İsterseniz global kurun; sonra doğrudan `eas` yazabilirsiniz:

```bash
npm install -g eas-cli
eas login
```

Expo hesap bilgilerinizle giriş yapın.

## 2. Production build (iOS)

### Sadece build (indirilebilir .ipa)

```bash
npx eas-cli build --platform ios --profile production
```

- Build Expo sunucularında yapılır (~15–30 dk).
- Bittiğinde tarayıcıda veya `eas build:list` ile .ipa linki alırsınız.

### Build + otomatik TestFlight’a gönderim

```bash
npx eas-cli build --platform ios --profile production --auto-submit
```

- Build bittikten sonra EAS, .ipa’yı App Store Connect’e yükler.
- İlk seferde Apple hesabı (App Store Connect API Key veya Apple ID) istenir; EAS bunu kaydeder.

## 3. Build durumunu kontrol

```bash
npx eas-cli build:list --platform ios
```

Expo dashboard:  
https://expo.dev/accounts/44network/projects/bluecrew-app/builds

## 4. Profil özeti (`eas.json`)

| Profil       | Kullanım              |
|-------------|------------------------|
| development | Geliştirme (dev client) |
| preview     | Dahili test           |
| **production** | App Store / TestFlight |

Production profilde `autoIncrement: true` ile her build’de build numarası otomatik artar.

## 5. İlk kez submit (TestFlight) için

1. [App Store Connect](https://appstoreconnect.apple.com) → uygulama (bundle ID: `com.bluecrew.app`) oluşturulmuş olmalı.
2. İlk `--auto-submit` veya `eas submit` sırasında EAS, Apple kimlik bilgilerinizi sorar:
   - **App-specific password** (Apple ID için) veya
   - **App Store Connect API Key** (önerilen)
3. Build işlendikten sonra TestFlight’ta “Ready to Test” olunca testçi ekleyip davet gönderebilirsiniz.

## Hızlı komutlar

```bash
# Giriş (EAS CLI yüklü değilse npx kullanın)
npx eas-cli login

# Production iOS build
npx eas-cli build --platform ios --profile production

# Production build + TestFlight’a gönder
npx eas-cli build --platform ios --profile production --auto-submit

# Liste
npx eas-cli build:list --platform ios
```
