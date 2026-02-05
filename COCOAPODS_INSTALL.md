# CocoaPods Kurulum Rehberi

## Hızlı Kurulum

Terminal'de şu komutu çalıştırın:

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project
sudo gem install cocoapods
```

Şifrenizi girmeniz istenecek. Kurulum birkaç dakika sürebilir.

## Kurulumu Doğrulama

```bash
pod --version
```

Versiyon görünüyorsa kurulum başarılı!

## CocoaPods Repo Setup (İlk Kez)

```bash
pod setup
```

Bu işlem biraz zaman alabilir (ilk kez).

## Alternatif: Script ile Kurulum

```bash
bash INSTALL_COCOAPODS.sh
```

## Kurulum Sonrası

CocoaPods kurulduktan sonra:

```bash
# Build script'ini tekrar çalıştır
bash FIX_BUILD_AND_RETRY.sh
```

## Sorun Giderme

### "Permission denied" hatası
```bash
sudo gem install cocoapods
```

### "Command not found: pod" hatası
PATH'e ekleyin:
```bash
export PATH="/usr/local/bin:$PATH"
# veya
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
```

### Gem kurulumu başarısız
```bash
# Gem'i güncelle
sudo gem update --system

# Tekrar dene
sudo gem install cocoapods
```
