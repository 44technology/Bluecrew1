# Build Hatası Çözümü

## Sorun
```
ReactNativeDependencies - Command PhaseScriptExecution failed
hermes-engine - Command PhaseScriptExecution failed
```

Bu hata, Xcode build script'lerinin Node.js'i bulamamasından kaynaklanır.

## Çözüm

### 1. `.xcode.env.local` Dosyası Oluşturuldu ✅

Bu dosya Xcode build script'lerine Node.js path'ini söyler. Dosya şu konumda:
```
ios/.xcode.env.local
```

### 2. Xcode'da Clean Build

1. Xcode'da: **Product > Clean Build Folder** (Shift + ⌘ + K)
2. Xcode'u kapatın
3. Xcode'u tekrar açın: `open -a Xcode ios/BlueCrew.xcworkspace`
4. Tekrar build edin: ⌘ + R

### 3. Eğer Hala Çalışmazsa

#### Seçenek A: Node.js Path'ini Güncelle

`.xcode.env.local` dosyasındaki path'i kontrol edin:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project/ios
cat .xcode.env.local
```

Eğer Node.js farklı bir yerdeyse, dosyayı düzenleyin:

```bash
# Node.js path'inizi bulun
which node

# .xcode.env.local dosyasında bu path'i kullanın
export NODE_BINARY="/path/to/your/node"
```

#### Seçenek B: Derived Data'yı Temizle

```bash
# Xcode'u kapat
pkill -f Xcode

# Derived Data'yı temizle
rm -rf ~/Library/Developer/Xcode/DerivedData

# Xcode'u tekrar aç
open -a Xcode ios/BlueCrew.xcworkspace
```

#### Seçenek C: Pods'u Yeniden Yükle

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

Sonra Xcode'u kapatıp yeniden açın.

## Kontrol

Build başarılı olup olmadığını kontrol edin:

1. Xcode'da build loglarını kontrol edin (View > Navigators > Show Report Navigator)
2. Hata mesajlarını okuyun
3. Eğer hala "node: command not found" görüyorsanız, `.xcode.env.local` dosyasını kontrol edin

## Özet

✅ `.xcode.env.local` dosyası oluşturuldu
⏭️  Xcode'da Clean Build yapın
⏭️  Tekrar build edin (⌘ + R)
