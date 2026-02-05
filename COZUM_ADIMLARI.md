# Build Hatası Çözüm Adımları

## Hızlı Çözüm

Terminal'de şu komutları sırayla çalıştırın:

```bash
# 1. Proje dizinine git
cd /Users/info44technology.com/Desktop/bluecrew1/project

# 2. NVM'i yükle
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. iOS dizinine git
cd ios

# 4. Pods'u temizle ve yeniden yükle
rm -rf Pods Podfile.lock
pod install

# 5. Ana dizine dön
cd ..

# 6. Xcode'u kapat (eğer açıksa) ve tekrar aç
pkill -f Xcode 2>/dev/null
sleep 2
open -a Xcode ios/BlueCrew.xcworkspace
```

## Xcode'da Yapılacaklar

1. **Clean Build Folder:**
   - Product > Clean Build Folder (Shift + ⌘ + K)

2. **Build:**
   - ⌘ + R ile build edin

## Eğer Hala Çalışmazsa

Xcode'da Build Settings'i kontrol edin:

1. Sol panelde **BlueCrew** projesine tıklayın
2. **Build Settings** sekmesine gidin
3. Arama kutusuna "Swift Compiler" yazın
4. **Import Paths** veya **Framework Search Paths** kontrol edin
5. Şunların olduğundan emin olun:
   - `$(inherited)`
   - `"${PODS_CONFIGURATION_BUILD_DIR}"`

## Özet

✅ CocoaPods bağımlılıkları yeniden yüklenecek
✅ Xcode workspace açılacak
✅ Clean Build yapılacak
✅ Tekrar build edilecek

Bu adımlar sorunu çözmeli. Eğer hala hata alırsanız, Xcode'daki tam hata mesajını paylaşın.
