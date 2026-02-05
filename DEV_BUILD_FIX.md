# "No development build" Hatası – Çözüm

Bu proje **expo-dev-client** kullanıyor. Yani cihazda/simülatörde **Expo Go** değil, bu projeye özel bir **development build** kurulu olmalı.

## Hata
```text
CommandError: No development build (com.bluecrew.app) for this project is installed.
Install a development build on the target device and try again.
```

## Çözüm

### 1. Development build’i kur (ilk kez veya temiz kurulum)

**iOS simülatör / cihaz:**
```bash
npx expo run:ios
```
Bu komut native iOS uygulamasını derler ve simülatöre (veya bağlı cihaza) yükler. İlk seferde birkaç dakika sürebilir.

**Android emülatör / cihaz:**
```bash
npx expo run:android
```

### 2. Bundan sonra her gün kullanım

1. Bir terminalde:
   ```bash
   npx expo start
   ```
2. Açılan **development build** uygulamasında (Expo Go değil) proje otomatik bağlanır veya QR kodu tarayın.

### Özet
- **Expo Go** bu projede kullanılmaz (custom native modüller var).
- Önce **bir kez** `npx expo run:ios` (veya `run:android`) ile development build’i kurun.
- Sonra geliştirme için hep `npx expo start` yeterli.

### Sadece web’de çalıştırmak isterseniz
Native build gerekmez:
```bash
npx expo start --web
```
veya `npm run web`
