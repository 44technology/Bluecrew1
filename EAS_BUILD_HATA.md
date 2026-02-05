# EAS Build Xcode Hatası – Adım Adım

Build "Run fastlane" aşamasında Xcode hatalarıyla düşüyor. Aşağıdakileri sırayla yapın.

## 1. Gerçek hata mesajını bulun

- Expo dashboard: **Build** → ilgili build’e tıklayın.
- **"Xcode Logs"** veya **"Build logs"** / **"Logs"** sekmesini açın.
- Sayfada **"error:"** veya **"Error"** geçen satırları bulun (genelde kırmızı veya vurgulu).
- O birkaç satırı (ve hemen üstündeki 2–3 satırı) kopyalayıp paylaşın; buna göre kesin çözüm söylenebilir.

## 2. Sık görülen düzeltmeler

### A) New Architecture’ı kapatmayı deneyin

Birçok EAS Xcode hatası New Architecture (React Native yeni mimari) kaynaklıdır. Production build’de geçici kapatmak genelde işe yarar.

**app.json** – `ios` içine `"newArchEnabled": false` ekleyin (zaten `true` ise `false` yapın):

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.bluecrew.app",
  "googleServicesFile": "./GoogleService-Info.plist",
  "newArchEnabled": false,
  ...
}
```

**ios/Podfile.properties.json** – `newArchEnabled` değerini `"false"` yapın:

```json
"newArchEnabled": "false"
```

Sonra yeniden build alın.

### B) EAS’ın kullandığı Xcode / image

`eas.json` içinde production profiline hangi image kullanıldığını görebilirsiniz. Varsayılan genelde sorunsuzdur; sadece loglarda “Xcode version” veya “image” geçen satırlara bakın.

### C) Code signing / credentials

Hata “signing”, “provisioning”, “certificate” veya “keychain” ile ilgiliyse:

- EAS dashboard → proje → **Credentials** (veya Build’de “Manage credentials”) kısmından iOS credentials’ı kontrol edin.
- Gerekirse “Clear credentials and try again” ile temizleyip bir sonraki build’de EAS’ın yeniden sormasını sağlayın.

## 3. Yeniden build

Değişiklikleri commit edip push ettikten sonra:

```bash
npx eas-cli build --platform ios --profile production
```

veya Expo dashboard’dan **New build** ile aynı profili seçin.

---

**Özet:** Önce EAS’taki **Xcode Logs**’tan gerçek hata satırlarını (error: …) paylaşın. İsterseniz aynı anda **2.A** adımını (New Architecture’ı kapatma) uygulayıp tekrar build alın; çoğu “genel” Xcode hatası bu şekilde çözülür.
