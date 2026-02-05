# Simulator'de Uygulamayı Yenileme

React Native/Expo uygulamalarını simulator'de yenilemenin birkaç yolu var.

## Yöntem 1: Shake Gesture (En Kolay) ⭐

Simulator'de:
1. **⌘ + Ctrl + Z** tuşlarına basın (veya **Device > Shake**)
2. Açılan menüden **"Reload"** seçeneğini seçin

## Yöntem 2: Klavye Kısayolu

Simulator'de:
- **⌘ + R** - Uygulamayı yenile (Reload)

## Yöntem 3: Metro Bundler Terminal'den

Metro bundler çalışırken terminal'de:
- **r** tuşuna basın - Reload
- **m** tuşuna basın - Dev menu aç

## Yöntem 4: Xcode'dan

Xcode'da:
1. Simulator'ü seçin
2. **Product > Run** (⌘ + R) - Uygulamayı yeniden build eder ve çalıştırır

## Yöntem 5: Metro Bundler'ı Yeniden Başlatma

Eğer uygulama çalışmıyorsa:

```bash
# Metro bundler'ı durdur (Ctrl + C)
# Sonra tekrar başlat
cd /Users/info44technology.com/Desktop/bluecrew1/project
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

## Yöntem 6: Simulator'ü Yeniden Başlatma

Eğer hiçbir şey çalışmıyorsa:

1. Simulator'ü kapatın (⌘ + Q)
2. Xcode'da: **Product > Run** (⌘ + R)
3. Veya terminal'den: `npm run ios`

## Hot Reload (Otomatik Yenileme)

Metro bundler çalışırken:
- Kod değişiklikleri **otomatik olarak** yansır
- Dosyayı kaydettiğinizde uygulama otomatik yenilenir
- State korunur (Fast Refresh)

## Sorun Giderme

### Uygulama Yenilenmiyor

1. **Metro bundler çalışıyor mu kontrol edin:**
   - Terminal'de Metro bundler penceresini kontrol edin
   - Eğer çalışmıyorsa: `npm run dev`

2. **Simulator'de manuel yenileme:**
   - ⌘ + Ctrl + Z (Shake)
   - "Reload" seçin

3. **Cache temizleme:**
   ```bash
   npm run dev -- --reset-cache
   ```

### "No development server found"

Metro bundler'ı başlatın:
```bash
npm run dev
```

## Hızlı Komutlar Özeti

| İşlem | Komut |
|-------|-------|
| Simulator'de yenile | ⌘ + R |
| Shake menu | ⌘ + Ctrl + Z |
| Metro bundler'da reload | Terminal'de `r` tuşu |
| Metro bundler'da menu | Terminal'de `m` tuşu |
| Metro bundler başlat | `npm run dev` |

## Önerilen Yöntem

**En kolay:** Simulator'de **⌘ + R** tuşlarına basın

Bu, uygulamayı hızlıca yeniler ve Metro bundler bağlantısını korur.
