# EAS Build Xcode Hatası – Adım Adım

Build "Run fastlane" aşamasında Xcode hatalarıyla düşüyor. Aşağıdakileri sırayla yapın.

## ⚠️ Bu projede Reanimated v4 var – New Architecture KAPATILMAZ

**react-native-reanimated v4**, New Architecture **açık olmadan** çalışmaz; podspec içinde kontrol eder ve kapalıysa hata verir. Bu yüzden **New Architecture’ı kapatma** seçeneği bu projede **uygulanamaz**. Hata çözümü için aşağıdaki diğer adımları ve gerçek log hatalarını kullanın.

---

## 1. Gerçek hata mesajını bulun

- Expo dashboard: **Build** → ilgili build’e tıklayın.
- **"Xcode Logs"** veya **"Build logs"** / **"Logs"** sekmesini açın.
- Sayfada **"error:"** veya **"Error"** geçen satırları bulun (genelde kırmızı veya vurgulu).
- O birkaç satırı (ve hemen üstündeki 2–3 satırı) kopyalayıp paylaşın; buna göre kesin çözüm söylenebilir.

## 2. Sık görülen düzeltmeler (New Arch açık kalacak)

### A) New Architecture’ı kapatma – BU PROJEDE YAPMAYIN

Bu projede **react-native-reanimated v4** kullanıldığı için `newArchEnabled: false` yapılmamalı. Reanimated v4 podspec’te New Architecture zorunludur; kapalıysa build başlamadan hata alırsınız. EAS hatasını aşağıdaki B, C ve gerçek log hatalarıyla çözün.

### B) EAS image / Xcode sürümü

`eas.json` içinde production profiline hangi image kullanıldığını görebilirsiniz (şu an: `macos-sonoma-14.6-xcode-16.1`). Gerekirse [EAS image listesinden](https://docs.expo.dev/build-reference/infrastructure/) daha güncel bir image deneyin. Varsayılan genelde sorunsuzdur; sadece loglarda “Xcode version” veya “image” geçen satırlara bakın.

### D) "PhaseScriptExecution [Expo] Configure project" hatası

Hata **"[Expo] Configure project"** script phase’inde düşüyorsa (ARCHIVE FAILED): Bu projede düzeltme yapıldı. Build phase artık `bash -l -c` (login shell) kullanmıyor; script doğrudan çalışıyor, böylece EAS’ta `node` PATH’te bulunuyor. Değişiklik `ios/BlueCrew.xcodeproj/project.pbxproj` içinde. Commit + push sonrası tekrar build alın.

### E) Code signing / credentials

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

**Özet (Reanimated v4 nedeniyle New Arch kapatılmaz):** Önce EAS’taki **Xcode Logs**’tan gerçek hata satırlarını (error: …) paylaşın. Hatayı 2.B (image), 2.C (credentials) veya logtaki spesifik mesaja göre çözün.
