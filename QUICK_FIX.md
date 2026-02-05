# iOS Build Hatası Hızlı Çözüm

## Adım 1: Build Loglarını Görüntüle

Terminal'de şu komutları çalıştırın:

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# Son build'i listele
eas build:list --platform ios --limit 1

# Build ID'yi kopyalayın ve logları görüntüleyin
eas build:view [BUILD_ID] --logs
```

Logları inceleyip gerçek hata mesajını bulun.

## Adım 2: Hızlı Çözüm (Çoğu Durumda İşe Yarar)

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# 1. Temizle
rm -rf node_modules ios
npm install

# 2. Prebuild (temiz)
npx expo prebuild --platform ios --clean

# 3. Pod install
cd ios
pod install
cd ..

# 4. Build tekrar dene
eas build --platform ios --profile production
```

## Adım 3: New Architecture'ı Kapat (Eğer Hala Hata Varsa)

`app.json` dosyasına şunu ekleyin:

```json
{
  "expo": {
    "ios": {
      "newArchEnabled": false
    }
  }
}
```

Sonra:
```bash
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
eas build --platform ios --profile production
```

## Detaylı Rehber

Daha fazla çözüm için: `IOS_BUILD_ERROR_FIX.md` dosyasına bakın.
