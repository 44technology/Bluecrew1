# Xcode'da Proje Açma Rehberi

Eğer Xcode'da "Create Project" görüyorsanız, workspace dosyası doğru açılmamış demektir.

## ✅ Doğru Yöntem

### Terminal'den Açma (ÖNERİLEN)

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
open -a Xcode ios/BlueCrew.xcworkspace
```

**ÖNEMLİ:** `.xcworkspace` dosyasını açın, `.xcodeproj` değil!

### Finder'dan Açma

1. Finder'ı açın
2. Şu klasöre gidin: `/Users/info44technology.com/Desktop/bluecrew1/project/ios`
3. **BlueCrew.xcworkspace** dosyasına çift tıklayın
4. **BlueCrew.xcodeproj** dosyasına DEĞİL!

## ❌ Yanlış Yöntem

- ❌ `.xcodeproj` dosyasını açmak (CocoaPods çalışmaz)
- ❌ Xcode'da "Create New Project" yapmak
- ❌ Workspace olmadan açmak

## Xcode Açıldıktan Sonra

1. **Sol panelde (Navigator) proje görünmeli:**
   - BlueCrew (proje)
   - Pods (bağımlılıklar)

2. **Eğer proje görünmüyorsa:**
   - Xcode'u kapatın
   - Terminal'den tekrar açın: `open -a Xcode ios/BlueCrew.xcworkspace`

3. **Build için:**
   - Sol üstte scheme: **BlueCrew** seçin
   - Sağ üstte device: **iPhone Simulator** seçin
   - **⌘ + R** ile build edin

## Sorun Giderme

### "No such module" Hataları
```bash
cd ios
pod install
cd ..
```
Sonra Xcode'u kapatıp yeniden açın.

### Workspace Açılmıyor
```bash
# Xcode'u tamamen kapat
pkill -f Xcode

# Workspace'i tekrar aç
open -a Xcode ios/BlueCrew.xcworkspace
```

### Pods Görünmüyor
```bash
cd ios
pod install
cd ..
open -a Xcode ios/BlueCrew.xcworkspace
```
