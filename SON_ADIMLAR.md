# Son Adımlar - Pod Install Tamamlama

## Sorun 1: Xcode Developer Directory

Terminal'de şu komutu çalıştırın (şifre isteyebilir):

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Eğer sudo çalışmıyorsa:
1. System Settings > Privacy & Security > Full Disk Access
2. Terminal'e izin verin
3. Terminal'i kapatıp yeniden açın
4. Tekrar deneyin

## Sorun 2: Pod Install'ı Tekrar Çalıştırın

Xcode developer directory ayarlandıktan sonra:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project/ios

# PATH'i ayarla
export PATH="/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH"

# Pod install'ı tekrar çalıştır
pod install
```

## Alternatif: Xcode'u Aç ve Build Et

Eğer pod install hala sorun çıkarıyorsa, Xcode'u açıp build edebilirsiniz:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project

# Xcode'u aç
open -a Xcode ios/BlueCrew.xcworkspace
```

Xcode'da:
1. **Product > Clean Build Folder** (Shift + ⌘ + K)
2. **⌘ + R** ile build edin

Xcode build sırasında eksik bağımlılıkları otomatik olarak yükleyecektir.

## PATH'i Kalıcı Yapma

Her terminal açılışında CocoaPods'un çalışması için:

```bash
# ~/.zshrc dosyasını düzenleyin
nano ~/.zshrc

# Şu satırı ekleyin:
export PATH="/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH"

# Kaydedin (Ctrl+O, Enter, Ctrl+X)
# Terminal'i yeniden başlatın
```

## Özet

1. ✅ `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
2. ✅ `pod install` tekrar çalıştır
3. ✅ Veya Xcode'da direkt build et
