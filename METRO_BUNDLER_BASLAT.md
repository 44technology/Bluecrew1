# Metro Bundler Başlatma Rehberi

"No development server found" hatası, Metro bundler'ın çalışmadığı anlamına gelir.

## Hızlı Çözüm

Terminal'de şu komutu çalıştırın:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project

# NVM'i yükle (eğer yeni terminal ise)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Metro bundler'ı başlat
npm run dev
```

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

Metro bundler başladıktan sonra simulator'de:
- **⌘ + R** tuşlarına basın
- Veya **⌘ + Ctrl + Z** → "Reload"

Uygulama otomatik olarak Metro bundler'a bağlanacaktır.

## Sorun Giderme

### Port Kullanımda

Eğer port 8081 kullanımdaysa:

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
# Cache'i temizleyerek başlat
npm run dev -- --reset-cache
```

### Metro Bundler Başlamıyor

1. **Node.js kontrolü:**
   ```bash
   node --version
   npm --version
   ```

2. **Bağımlılıkları kontrol et:**
   ```bash
   npm install
   ```

3. **Metro bundler'ı temiz başlat:**
   ```bash
   npm run dev -- --reset-cache
   ```

## Metro Bundler Çalışırken

- **Kod değişiklikleri otomatik yansır** (Hot Reload)
- **Hatalar ekranda görünür**
- **Simulator'daki uygulama canlı kalır**

## Metro Bundler'ı Durdurma

Metro bundler terminal'inde:
- **Ctrl + C** tuşlarına basın

## Özet

1. ✅ Terminal açın
2. ✅ Proje dizinine gidin
3. ✅ `npm run dev` çalıştırın
4. ✅ Simulator'de ⌘ + R ile yenileyin

Metro bundler çalıştıktan sonra "No development server found" hatası kaybolacaktır!
