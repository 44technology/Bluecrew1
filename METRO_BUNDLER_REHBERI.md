# Metro Bundler Rehberi

"No development server found" hatası, Metro bundler'ın çalışmadığı anlamına gelir.

## Hızlı Çözüm

### Terminal'de Metro Bundler'ı Başlatın

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project

# NVM'i yükle (eğer yeni terminal ise)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Metro bundler'ı başlat
npm start
```

Metro bundler başladıktan sonra simulator'daki uygulama otomatik olarak yenilenecektir.

## Metro Bundler Nedir?

Metro bundler, React Native uygulamaları için JavaScript kodunu bundle'layan (paketleyen) geliştirme sunucusudur. Development modunda çalışırken her zaman çalışır durumda olmalıdır.

## Metro Bundler Özellikleri

- **Hot Reload:** Kod değişikliklerini anında yansıtır
- **Fast Refresh:** State'i koruyarak hızlı yenileme
- **Error Overlay:** Hataları ekranda gösterir

## Metro Bundler Komutları

### Başlatma
```bash
npm start
# veya
npx expo start
```

### Temiz Başlatma
```bash
npm start -- --reset-cache
```

### Web'de Açma
```bash
npm start -- --web
```

### Belirli Port'ta Çalıştırma
```bash
npm start -- --port 8081
```

## Sorun Giderme

### Metro Bundler Başlamıyor

1. **Port kullanımda:**
   ```bash
   # Port'u kontrol et
   lsof -i :8081
   
   # Kullanıyorsa, process'i öldür
   kill -9 $(lsof -t -i:8081)
   ```

2. **Cache sorunu:**
   ```bash
   npm start -- --reset-cache
   ```

3. **Node.js sorunu:**
   ```bash
   # Node.js versiyonunu kontrol et
   node --version
   
   # NVM'i yükle
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

### Simulator Metro'ya Bağlanamıyor

1. **Manuel bağlantı:**
   - Simulator'de: **Device > Shake** (⌘ + Ctrl + Z)
   - "Configure Bundler" seçeneğini seçin
   - Metro bundler'ın IP adresini girin (genelde `localhost:8081`)

2. **Network kontrolü:**
   ```bash
   # Metro bundler çalışıyor mu?
   curl http://localhost:8081/status
   ```

### Metro Bundler Yavaş

1. **Cache temizle:**
   ```bash
   npm start -- --reset-cache
   ```

2. **Watchman kur:**
   ```bash
   brew install watchman
   ```

## Metro Bundler Çalışırken

Metro bundler çalışırken terminal'de şunları göreceksiniz:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor
```

## Özet

1. ✅ Metro bundler'ı başlat: `npm start`
2. ✅ Simulator'de uygulama otomatik yenilenecek
3. ✅ Kod değişiklikleri anında yansır (Hot Reload)

## İpuçları

- Metro bundler'ı **ayrı bir terminal penceresinde** çalıştırın
- Xcode build yaparken Metro bundler'ın çalışır durumda olması gerekir
- Metro bundler'ı durdurmak için: **Ctrl + C**
