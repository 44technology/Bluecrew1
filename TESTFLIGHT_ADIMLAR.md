# TestFlight'a Production Build Gönderme

## Ön koşullar (bir kez)

1. **Apple Developer Program** üyeliği (ücretli).
2. **App Store Connect**'te uygulama oluşturulmuş olmalı:
   - https://appstoreconnect.apple.com → My Apps → + → New App
   - Bundle ID: `com.bluecrew.app` (app.json ile aynı)
   - İsim: Blue Crew (veya istediğiniz)
3. **Expo (EAS) hesabı**: https://expo.dev → giriş (owner: `44network`).

---

## Adım 1: EAS girişi

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx eas-cli login
```

Expo hesabınızla giriş yapın.

---

## Adım 2: Production build + TestFlight’a gönder

Tek komutla hem build alır hem TestFlight’a yüklersiniz:

```bash
npx eas-cli build --platform ios --profile production --auto-submit
```

- Build **Expo sunucularında** yapılır (yaklaşık 15–30 dakika).
- İlk seferde EAS, **Apple kimlik bilgilerini** ister:
  - **Önerilen:** App Store Connect API Key (App Store Connect → Users and Access → Keys).
  - Veya: Apple ID + **App-specific password** (appleid.apple.com’dan oluşturulur).
- Build bittikten sonra .ipa otomatik olarak App Store Connect’e gönderilir.

---

## Adım 3: Build durumunu takip

- **Komut satırı:**
  ```bash
  npx eas-cli build:list --platform ios
  ```
- **Expo dashboard:**  
  https://expo.dev/accounts/44network/projects/bluecrew-app/builds

---

## Adım 4: TestFlight’ta test

1. **App Store Connect** → uygulamanız → **TestFlight** sekmesi.
2. Build işlendikten sonra “Ready to Submit” / “Ready to Test” olur.
3. **Internal Testing:** Takım üyeleri (App Store Connect’te rol tanımlı) hemen test edebilir.
4. **External Testing:** Testçi ekleyip davet gönderirsiniz (ilk kez Apple incelemesi gerekebilir).

---

## Sadece build (submit etmeden)

Önce sadece .ipa alıp sonra manuel yüklemek isterseniz:

```bash
npx eas-cli build --platform ios --profile production
```

Build bitince .ipa linki gelir; TestFlight’a sonra şu ile yükleyebilirsiniz:

```bash
npx eas-cli submit --platform ios --latest
```

---

## Sorun çıkarsa

- **“App Store Connect’te uygulama yok”** → Önce App Store Connect’te Bundle ID `com.bluecrew.app` ile uygulama oluşturun.
- **“Invalid credentials”** → API Key veya app-specific password’ü kontrol edin.
- **Build failed** → `eas build:list` veya Expo dashboard’dan log’a bakın; genelde dependency veya config hatasıdır.
