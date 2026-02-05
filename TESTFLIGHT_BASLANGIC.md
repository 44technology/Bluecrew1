# TestFlight'a Yüklemeye Başlamak İçin

Development build yerine **TestFlight** üzerinden beta dağıtımı yapmak için aşağıdaki adımları izleyin.

---

## Önkoşullar (bir kez)

| Gereksinim | Açıklama |
|------------|----------|
| **Apple Developer hesabı** | Yıllık $99, [developer.apple.com](https://developer.apple.com) |
| **EAS CLI** | `npm install -g eas-cli` sonra `eas login` |
| **Expo projesi EAS'a bağlı** | Projenizde `app.json` → `extra.eas.projectId` zaten var |

---

## Adım 1: App Store Connect'te uygulamayı oluştur

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**
2. **Platform:** iOS  
3. **Name:** Blue Crew (veya görünmesini istediğiniz ad)  
4. **Primary Language:** İngilizce (veya tercih ettiğiniz dil)  
5. **Bundle ID:** `com.bluecrew.app` (app.json ile aynı olmalı)  
6. **SKU:** Benzersiz bir kod (örn: `bluecrew-ios-2026`)  
7. **Create** ile kaydedin.

Bu adım olmadan TestFlight’a build yükleyemezsiniz.

---

## Adım 2: iOS production build al

Proje klasöründe:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project

# EAS'a giriş (henüz yapmadıysanız)
eas login

# iOS production build (Expo sunucularında derlenir, ~15–30 dk)
eas build --platform ios --profile production
```

- Build bittiğinde EAS bir **.ipa** indirme linki verir.  
- Durum: `eas build:list`

---

## Adım 3: Build’i TestFlight’a gönder

### Seçenek A: Tek komutla build + gönderim (önerilen)

```bash
eas build --platform ios --profile production --auto-submit
```

Build bittikten sonra EAS, uygulamayı doğrudan App Store Connect’e (TestFlight’a) yükler.

### Seçenek B: Önce build, sonra gönderim

```bash
# 1. Build (Adım 2’de yaptıysanız tekrar gerekmez)
eas build --platform ios --profile production

# 2. Build bittikten sonra gönder
eas submit --platform ios --latest
```

### İlk kez submit ederken

- EAS, **Apple ID** ve **App-specific password** veya **App Store Connect API Key** isteyebilir.  
- API Key: App Store Connect → **Users and Access** → **Keys** → yeni key oluşturup EAS’a tanımlayın.

---

## Adım 4: TestFlight’ta testçi ekleme

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **Blue Crew** (veya uygulama adınız)  
2. **TestFlight** sekmesi  
3. İlk build yüklendikten sonra Apple işleme alır (birkaç dakika – 24 saat arası olabilir)  
4. Build “Ready to Test” olduktan sonra:  
   - **Internal Testing:** Ekip üyeleri (App Store Connect kullanıcıları)  
   - **External Testing:** Email ile davet gönderdiğiniz testçiler  
5. Testçi e-postalarını ekleyin; davet mailleri otomatik gider.

---

## Hızlı komut özeti

```bash
# 1. Giriş
eas login

# 2. Build + otomatik TestFlight’a gönderim
eas build --platform ios --profile production --auto-submit

# 3. Durum kontrolü
eas build:list
```

---

## Önemli notlar

- **Bundle ID:** `com.bluecrew.app` (app.json’da tanımlı) – App Store Connect’teki uygulama ile aynı olmalı.  
- **Sürüm:** `eas.json` → `production` profili `autoIncrement: true` ile build numarasını otomatik artırır.  
- **GoogleService-Info.plist:** `app.json`’da `ios.googleServicesFile: "./GoogleService-Info.plist"` tanımlı; dosyanın proje kökünde olduğundan emin olun.  
- Detaylı sorun giderme ve alternatif yöntemler için: **TESTFLIGHT_DEPLOY.md**

Bu adımları tamamladığınızda TestFlight’a yüklemeye başlamış olursunuz.
