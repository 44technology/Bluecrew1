# Expo upgrade (SDK 54) – Yapılanlar

`npx expo upgrade` artık desteklenmiyor; aynı işlem rehbere göre manuel yapıldı.

## Yapılan adımlar

1. **`npx expo install --fix`**  
   SDK 54 ile uyumlu paket sürümleri kuruldu / güncellendi (expo, react-native, expo-router, datetimepicker vb.).

2. **`app.json` asset yolları düzeltildi**  
   - `android.adaptiveIcon.foregroundImage`: `./assets/adaptive-icon.png` → `./assets/images/icon.png` (dosya yoktu).  
   - Web favicon zaten `./assets/images/favicon.png` olarak doğruydu.

3. **`npx expo-doctor`**  
   Çalıştırıldı; schema hatası giderildi.

## Doctor’da kalan 2 uyarı (bilinen / kabul edilebilir)

- **“App config fields may not be synced in a non-CNG project”**  
  Projede `ios/` ve `android/` zaten var; EAS Build bu native klasörleri kullanır ve app.json’daki bazı alanları otomatik sync etmez. Bu, bu proje yapısı için normal.

- **“Packages match versions required by installed Expo SDK”**  
  `npx expo install --check` “Dependencies are up to date” diyor; yine de doctor bu uyarıyı gösterebiliyor. Ana paketler (expo, react-native, expo-router, datetimepicker) SDK 54 ile uyumlu sürümlerde.

## İleride upgrade nasıl yapılır?

Expo rehberi: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/

1. Yeni SDK sürümünü kur: `npm install expo@^55.0.0` (hedef sürüme göre).
2. Bağımlılıkları hizala: `npx expo install --fix`.
3. Kontrol: `npx expo-doctor`.
4. Varsa native güncelleme: `cd ios && npx pod-install` (veya prebuild kullanıyorsanız `npx expo prebuild`).

## npm uyarısı

`npm warn Unknown env config "devdir"` npm’e ait; projeyi bozmaz. İsterseniz ileride npm sürümünü güncelleyebilirsiniz.
