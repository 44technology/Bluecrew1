# CocoaPods Hatası Çözümü

## Sorun
```
bash: /usr/local/bin/pod: /System/Library/Frameworks/Ruby.framework/Versions/2.3/usr/bin/ruby: bad interpreter
```

## Çözüm Adımları

### 1. Xcode Command Line Tools Kurulumu
Dialog açıldığında "Install" butonuna tıklayın. Kurulum 5-10 dakika sürebilir.

### 2. CocoaPods'u Homebrew ile Kurun
Command Line Tools kurulumu tamamlandıktan sonra:
```bash
brew install cocoapods
```

### 3. Pod Install Yapın
```bash
cd /Users/aliakda/Desktop/bluecrew1/project/ios
pod install
```

### 4. Xcode Workspace'i Açın
```bash
cd /Users/aliakda/Desktop/bluecrew1/project
open ios/BlueCrew.xcworkspace
```

## Alternatif: CocoaPods Olmadan Build

Eğer CocoaPods kurulumu sorun çıkarırsa, Xcode ile direkt build edebilirsiniz:

1. Xcode'u açın:
```bash
open ios/BlueCrew.xcodeproj
```

2. Xcode'da:
   - Sol üstten cihaz/simülatör seçin
   - Product > Build (⌘B)

**Not:** Bazı native modüller CocoaPods gerektirebilir. Bu durumda CocoaPods kurulumunu tamamlamanız gerekir.

## Hızlı Test

Command Line Tools kurulumu tamamlandıktan sonra:
```bash
xcode-select -p
# Çıktı: /Library/Developer/CommandLineTools veya /Applications/Xcode.app/Contents/Developer

brew install cocoapods
cd /Users/aliakda/Desktop/bluecrew1/project/ios
pod install
```
