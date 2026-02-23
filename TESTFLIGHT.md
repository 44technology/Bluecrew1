# TestFlight için Adımlar

## Ön koşullar
- **Apple Developer hesabı** (ücretli, yıllık)
- **App Store Connect**’te uygulama oluşturulmuş olmalı (bundle ID: `com.bluecrew.app`)
- EAS CLI: `npm install -g eas-cli` (yoksa)
- EAS’e giriş: `eas login`

---

## 1. iOS build (EAS)

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
eas build --platform ios --profile production
```

- Build tamamlanınca EAS bir **.ipa** linki verir.
- İlk seferde Apple hesabı ve sertifika/ provisioning sorulur; EAS bunları yönetebilir.

---

## 2. App ID (ascAppId) – bir kez ayarla

Otomatik gönderim için `eas.json` içinde **App Store Connect App ID** gerekir.

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → uygulamanı aç.
2. Tarayıcı adres çubuğundaki URL’e bak:  
   `https://appstoreconnect.apple.com/apps/**123456789**/appstore`  
   Buradaki **123456789** sayısı senin App ID’n.
3. Projede `eas.json` dosyasını aç, `submit.production.ios.ascAppId` değerini bu sayıyla değiştir:
   ```json
   "submit": {
     "production": {
       "ios": {
         "ascAppId": "123456789"
       }
     }
   }
   ```
   (Örnekteki `123456789` yerine kendi App ID’ni yaz.)

---

## 3. TestFlight’a gönderme

### Seçenek A: Build sırasında otomatik submit (bir sonraki build)
```bash
eas build --platform ios --profile production --auto-submit
```
(Build bittikten sonra otomatik App Store Connect’e yüklenir. `ascAppId` dolu olmalı.)

### Seçenek B: Oluşan (en son) IPA’yı şimdi gönder
```bash
eas submit --platform ios --latest
```
(Önce `eas.json`’da `ascAppId` doldur. Yoksa komutu **interaktif** çalıştır: `--non-interactive` kullanma, EAS uygulama seçtirir.)

---

## 3. App Store Connect tarafı

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → uygulamanı seç.
2. **TestFlight** sekmesine gir.
3. Build işlendikten sonra (birkaç dakika–bir saat) build listede görünür.
4. **Internal Testing** veya **External Testing** grubu oluştur, testçileri ekle.
5. Testçiler e-posta daveti alır; TestFlight uygulamasından indirirler.

---

## 4. İlk kez uygulama yoksa (App Store Connect)

1. App Store Connect → **My Apps** → **+** → **New App**.
2. **Platform:** iOS.  
3. **Name:** Blue Crew.  
4. **Primary Language:** English (veya istediğin dil).  
5. **Bundle ID:** `com.bluecrew.app` (Xcode/EAS’teki ile aynı olmalı).  
6. **SKU:** örn. `bluecrew-ios-1`.

---

## Hızlı komutlar (proje kökünde)

| Amaç              | Komut |
|-------------------|--------|
| iOS production build | `eas build --platform ios --profile production` |
| Build + otomatik submit | `eas build --platform ios --profile production --auto-submit` |
| Son build’i submit et | `eas submit --platform ios --latest` |
| Build durumu        | `eas build:list` |

Build tamamlandığında EAS tarafında “Build finished” e-postası gelir; ardından App Store Connect → TestFlight’ta build’i görüp test gruplarına atayabilirsin.
