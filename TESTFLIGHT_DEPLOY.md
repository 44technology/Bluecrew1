# TestFlight Deployment Guide

## Önkoşullar

1. **Apple Developer Account**: Aktif bir Apple Developer hesabınız olmalı (yıllık $99)
2. **App Store Connect**: Uygulamanız App Store Connect'te kayıtlı olmalı
3. **EAS CLI**: Yüklü ve yapılandırılmış olmalı (`npm install -g eas-cli`)
4. **EAS Login**: EAS CLI'ye giriş yapmış olmalısınız (`eas login`)

## Adım 1: EAS CLI Kontrolü

```bash
# EAS CLI yüklü mü kontrol et
eas --version

# Eğer yüklü değilse:
npm install -g eas-cli

# EAS'a giriş yap (Expo hesabınızla)
eas login
```

## Adım 2: App Store Connect'te Uygulama Oluşturma

1. [App Store Connect](https://appstoreconnect.apple.com) → "My Apps" → "+" → "New App"
2. **Platform**: iOS seçin
3. **Name**: Uygulama adınız (örn: "BlueCrew")
4. **Primary Language**: Dil seçin
5. **Bundle ID**: `com.bluecrew.app` (app.json'da tanımlı)
6. **SKU**: Benzersiz bir SKU (örn: "bluecrew-ios-2026")
7. **User Access**: "Full Access" veya "App Manager" seçin

## Adım 3: Production Build Oluşturma

```bash
# Proje dizininde
cd /Users/danielamartinez/Documents/bluecrew1/project

# Production build başlat (cloud build)
eas build --platform ios --profile production
```

**Notlar:**
- İlk build 15-30 dakika sürebilir
- Build tamamlandığında size bir URL verilecek
- Build durumunu kontrol etmek için: `eas build:list`

## Adım 4: Build'i App Store Connect'e Yükleme

### Otomatik Yükleme (Önerilen)

Build tamamlandıktan sonra, EAS otomatik olarak App Store Connect'e yükleyebilir:

```bash
# Build tamamlandıktan sonra otomatik yükleme için
eas build --platform ios --profile production --auto-submit
```

### Manuel Yükleme

1. Build tamamlandığında, EAS size bir `.ipa` dosyası indirme linki verecek
2. [Transporter](https://apps.apple.com/us/app/transporter/id1450874784) uygulamasını indirin (Mac App Store'dan)
3. `.ipa` dosyasını Transporter ile yükleyin
4. Veya `xcrun altool` kullanarak komut satırından yükleyin:

```bash
# App Store Connect API key gerekli
xcrun altool --upload-app --type ios --file path/to/your.ipa \
  --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID
```

## Adım 5: TestFlight'ta Test Edici Ekleme

1. App Store Connect → Uygulamanız → "TestFlight" sekmesi
2. İlk build yüklendikten sonra, Apple'ın incelemesi gerekebilir (genellikle 24-48 saat)
3. Build onaylandıktan sonra:
   - "Internal Testing" veya "External Testing" seçin
   - Test ediciler ekleyin (email adresleri)
   - Test ediciler email ile davet alacak

## Adım 6: Build Durumunu Kontrol Etme

```bash
# Tüm build'leri listele
eas build:list

# Belirli bir build'in detaylarını gör
eas build:view [BUILD_ID]
```

## Önemli Notlar

### Bundle Identifier
- `app.json` içinde `ios.bundleIdentifier: "com.bluecrew.app"` olmalı
- Bu, App Store Connect'teki Bundle ID ile tam olarak eşleşmeli

### Sürüm Numaraları
- `eas.json` içinde `production` profili `autoIncrement: true` kullanıyor
- Her build otomatik olarak build numarasını artırır
- `app.json` içindeki `version` alanını manuel olarak güncelleyebilirsiniz

### Google Services
- `app.json` içinde `ios.googleServicesFile: "./GoogleService-Info.plist"` tanımlı
- Bu dosyanın proje root'unda olduğundan emin olun

### İlk Build İçin Özel Adımlar

1. **Provisioning Profile**: EAS otomatik olarak oluşturur, ancak ilk seferde Apple Developer hesabınıza erişim izni isteyebilir
2. **Certificates**: EAS otomatik olarak yönetir
3. **App Store Connect API Key** (Opsiyonel ama önerilen):
   ```bash
   # App Store Connect → Users and Access → Keys → Generate API Key
   # Sonra EAS'a ekleyin:
   eas credentials
   ```

## Sorun Giderme

### Build Başarısız Olursa

```bash
# Build loglarını kontrol et
eas build:view [BUILD_ID] --logs

# Yerel build yapmayı dene (daha hızlı debug için)
eas build --platform ios --profile production --local
```

### Credentials Sorunları

```bash
# Credentials'ları kontrol et
eas credentials

# Credentials'ları sıfırla (gerekirse)
eas credentials --platform ios
```

### TestFlight'ta Build Görünmüyor

1. Build'in tamamlandığını kontrol edin (`eas build:list`)
2. App Store Connect'te "TestFlight" sekmesinde bekleyin (bazen 5-10 dakika sürebilir)
3. Apple'ın işleme süresi gerekebilir (ilk build için daha uzun)

## Hızlı Başlangıç Komutları

```bash
# 1. EAS'a giriş yap
eas login

# 2. Production build başlat
eas build --platform ios --profile production

# 3. Build tamamlandıktan sonra otomatik yükle
eas build --platform ios --profile production --auto-submit

# 4. Build durumunu kontrol et
eas build:list
```

## Sonraki Adımlar

1. ✅ Build tamamlandı
2. ✅ App Store Connect'e yüklendi
3. ⏳ Apple'ın incelemesi (ilk build için)
4. ⏳ Test ediciler ekle
5. ⏳ Test edicilere davet gönder
6. ⏳ Geri bildirim topla
7. ⏳ Production release için hazır ol

---

**Sorularınız için**: EAS dokümantasyonu: https://docs.expo.dev/build/introduction/
