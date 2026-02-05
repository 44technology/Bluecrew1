# Metro Bundler Başlatma

Bu projede `npm start` yerine `npm run dev` kullanılmalı.

## Metro Bundler'ı Başlatma

### Yöntem 1: npm run dev (ÖNERİLEN)

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project

# NVM'i yükle (eğer yeni terminal ise)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Metro bundler'ı başlat
npm run dev
```

### Yöntem 2: npx expo start

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project

# NVM'i yükle
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Metro bundler'ı başlat
npx expo start
```

## Mevcut Script'ler

Bu projede kullanılabilir script'ler:

- `npm run dev` - Metro bundler başlatır (iOS/Android)
- `npm run ios` - iOS build ve simulator'de çalıştırır
- `npm run android` - Android build ve emulator'de çalıştırır
- `npm run web` - Web'de çalıştırır

## Metro Bundler Başladıktan Sonra

Metro bundler başladığında terminal'de şunları göreceksiniz:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

## Simulator'de Yenileme

Metro bundler çalışırken:
- Simulator'daki uygulama otomatik olarak yenilenecek
- Kod değişiklikleri anında yansır (Hot Reload)

Eğer otomatik yenilenmezse:
1. Simulator'de: **Device > Shake** (⌘ + Ctrl + Z)
2. "Reload" seçeneğini seçin

## Sorun Giderme

### Port Kullanımda

```bash
# Port'u kontrol et
lsof -i :8081

# Kullanıyorsa, process'i öldür
kill -9 $(lsof -t -i:8081)

# Tekrar başlat
npm run dev
```

### Cache Sorunu

```bash
npm run dev -- --reset-cache
```

## Özet

✅ **Doğru komut:** `npm run dev` (veya `npx expo start`)
❌ **Yanlış komut:** `npm start` (bu script yok)

Metro bundler başladıktan sonra simulator'daki uygulama otomatik olarak çalışacaktır!
