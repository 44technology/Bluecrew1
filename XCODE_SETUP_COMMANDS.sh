#!/bin/bash

# Xcode 14.x Yapılandırma Komutları
# Terminal'de bu komutları sırayla çalıştırın

echo "=== Xcode Yapılandırması ==="

# 1. Xcode path'ini ayarla (şifre isteyecek)
echo "1. Xcode path ayarlanıyor..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 2. Lisansı kabul et
echo "2. Xcode lisansı kabul ediliyor..."
sudo xcodebuild -license accept

# 3. Versiyonu kontrol et
echo "3. Xcode versiyonu kontrol ediliyor..."
xcodebuild -version

# 4. CocoaPods kurulumu
echo "4. CocoaPods kuruluyor..."
sudo gem install cocoapods

# 5. CocoaPods versiyonu kontrol et
echo "5. CocoaPods versiyonu kontrol ediliyor..."
pod --version

# 6. Pod install
echo "6. Pod install yapılıyor..."
cd /Users/aliakda/Desktop/bluecrew1/project/ios
pod install

# 7. Xcode workspace aç
echo "7. Xcode workspace açılıyor..."
cd /Users/aliakda/Desktop/bluecrew1/project
open ios/BlueCrew.xcworkspace

echo "=== Tamamlandı! ==="
echo "Xcode açıldı. Build için Product > Build (⌘B) yapın."
