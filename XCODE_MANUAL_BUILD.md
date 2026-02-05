# Xcode'da Manuel iOS Build ve Test

CocoaPods kurulum sorunu varsa, Xcode'u kullanarak manuel build yapabilirsiniz.

## Adımlar

### 1. Xcode'u Aç
```bash
open -a Xcode ios/BlueCrew.xcworkspace
```

**ÖNEMLİ:** `.xcworkspace` dosyasını açın, `.xcodeproj` değil!

### 2. Xcode'da Build Ayarları

1. **Scheme Seçimi:**
   - Sol üstte "BlueCrew" scheme'ini seçin

2. **Simulator Seçimi:**
   - Sağ üstte device seçiciye tıklayın
   - Bir iPhone simulator seçin (örn: iPhone 15, iPhone 15 Pro)

### 3. Build ve Run

**Yöntem 1: Klavye Kısayolu**
- **⌘ + R** (Cmd + R) tuşlarına basın

**Yöntem 2: Menü**
- Üst menüden: **Product > Run**

### 4. Metro Bundler'ı Başlat

Xcode build tamamlandıktan sonra, uygulama simulator'de açılır ama JavaScript bundle yüklenmez. Metro bundler'ı ayrı bir terminal'de başlatın:

```bash
# Terminal'i açın ve proje dizinine gidin
cd /Users/info44technology.com/Desktop/bluecrew1/project

# NVM'i yükle (eğer yeni terminal ise)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Metro bundler'ı başlat
npm start
# veya
npx expo start
```

Metro bundler başladıktan sonra simulator'daki uygulama otomatik olarak yenilenecektir.

## Sorun Giderme

### "Build Failed" Hatası
1. Xcode'da: **Product > Clean Build Folder** (Shift + ⌘ + K)
2. Tekrar build edin: ⌘ + R

### Metro Bundler Bağlanamıyor
1. Metro bundler'ın çalıştığından emin olun
2. Simulator'de: **Device > Shake** (⌘ + Ctrl + Z)
3. "Configure Bundler" seçeneğini seçin
4. Metro bundler'ın IP adresini girin (genelde `localhost:8081`)

### CocoaPods Hataları
Eğer CocoaPods ile ilgili hata alıyorsanız:

```bash
cd ios
pod install
cd ..
```

Sonra Xcode'u kapatıp yeniden açın.

## Hızlı Komutlar

```bash
# Xcode'u aç
open -a Xcode ios/BlueCrew.xcworkspace

# Metro bundler (ayrı terminal)
cd /Users/info44technology.com/Desktop/bluecrew1/project
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm start
```
