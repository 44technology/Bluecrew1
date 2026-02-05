#!/bin/bash

echo "🧹 iOS Build Derin Temizlik ve Yeniden Oluşturma"
echo "================================================"
echo ""

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Proje dizinine git
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

echo -e "${BLUE}📍 Proje dizini: $PROJECT_DIR${NC}"
echo ""

# 1. iOS Pods dizinini sil
echo -e "${YELLOW}1️⃣ iOS Pods dizini siliniyor...${NC}"
if [ -d "ios/Pods" ]; then
    rm -rf ios/Pods
    echo -e "${GREEN}✅ ios/Pods silindi${NC}"
else
    echo -e "${BLUE}ℹ️  ios/Pods zaten yok${NC}"
fi
echo ""

# 2. Podfile.lock dosyasını sil
echo -e "${YELLOW}2️⃣ Podfile.lock siliniyor...${NC}"
if [ -f "ios/Podfile.lock" ]; then
    rm ios/Podfile.lock
    echo -e "${GREEN}✅ ios/Podfile.lock silindi${NC}"
else
    echo -e "${BLUE}ℹ️  ios/Podfile.lock zaten yok${NC}"
fi
echo ""

# 3. Xcode DerivedData temizle
echo -e "${YELLOW}3️⃣ Xcode DerivedData temizleniyor...${NC}"
DERIVED_DATA_PATH="$HOME/Library/Developer/Xcode/DerivedData"
if [ -d "$DERIVED_DATA_PATH" ]; then
    # BlueCrew ile ilgili DerivedData'yı bul ve sil
    find "$DERIVED_DATA_PATH" -maxdepth 1 -name "*BlueCrew*" -type d -exec rm -rf {} + 2>/dev/null || true
    echo -e "${GREEN}✅ Xcode DerivedData temizlendi${NC}"
else
    echo -e "${BLUE}ℹ️  DerivedData dizini bulunamadı${NC}"
fi
echo ""

# 4. iOS build klasörünü sil
echo -e "${YELLOW}4️⃣ iOS build klasörü siliniyor...${NC}"
if [ -d "ios/build" ]; then
    rm -rf ios/build
    echo -e "${GREEN}✅ ios/build silindi${NC}"
else
    echo -e "${BLUE}ℹ️  ios/build zaten yok${NC}"
fi
echo ""

# 5. node_modules dizinini sil
echo -e "${YELLOW}5️⃣ node_modules siliniyor...${NC}"
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}✅ node_modules silindi${NC}"
else
    echo -e "${BLUE}ℹ️  node_modules zaten yok${NC}"
fi
echo ""

# 6. package-lock.json dosyasını sil
echo -e "${YELLOW}6️⃣ package-lock.json siliniyor...${NC}"
if [ -f "package-lock.json" ]; then
    rm package-lock.json
    echo -e "${GREEN}✅ package-lock.json silindi${NC}"
else
    echo -e "${BLUE}ℹ️  package-lock.json zaten yok${NC}"
fi
echo ""

# 7. npm cache temizle
echo -e "${YELLOW}7️⃣ npm cache temizleniyor...${NC}"
npm cache clean --force
echo -e "${GREEN}✅ npm cache temizlendi${NC}"
echo ""

# 8. Node modüllerini yeniden yükle
echo -e "${YELLOW}8️⃣ Node modülleri yeniden yükleniyor...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ npm install başarılı${NC}"
else
    echo -e "${RED}❌ npm install başarısız oldu${NC}"
    exit 1
fi
echo ""

# 9. iOS native kodlarını temiz prebuild ile oluştur
echo -e "${YELLOW}9️⃣ iOS native kodları temiz prebuild ile oluşturuluyor...${NC}"
echo -e "${BLUE}ℹ️  New Architecture aktif (app.json'da newArchEnabled: true)${NC}"
npx expo prebuild --platform ios --clean
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ expo prebuild başarılı${NC}"
else
    echo -e "${RED}❌ expo prebuild başarısız oldu${NC}"
    exit 1
fi
echo ""

# 10. GoogleService-Info.plist kontrolü
echo -e "${YELLOW}🔟 GoogleService-Info.plist kontrol ediliyor...${NC}"
if [ ! -f "ios/BlueCrew/GoogleService-Info.plist" ]; then
    if [ -f "GoogleService-Info.plist" ]; then
        cp GoogleService-Info.plist ios/BlueCrew/
        echo -e "${GREEN}✅ GoogleService-Info.plist kopyalandı${NC}"
    else
        echo -e "${RED}⚠️  UYARI: GoogleService-Info.plist bulunamadı!${NC}"
        echo -e "${YELLOW}   Firebase Console'dan indirip ios/BlueCrew/ dizinine koymanız gerekiyor${NC}"
    fi
else
    echo -e "${GREEN}✅ GoogleService-Info.plist mevcut${NC}"
fi
echo ""

# 11. CocoaPods bağımlılıklarını yükle
echo -e "${YELLOW}1️⃣1️⃣ CocoaPods bağımlılıkları yükleniyor...${NC}"
cd ios
pod deintegrate 2>/dev/null || true
pod install --repo-update
POD_RESULT=$?
cd ..

if [ $POD_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ pod install başarılı${NC}"
else
    echo -e "${RED}❌ pod install başarısız oldu${NC}"
    echo -e "${YELLOW}Lütfen hataları kontrol edin ve gerekirse Ruby/CocoaPods güncellemesi yapın${NC}"
    exit 1
fi
echo ""

# 12. Xcode workspace'i kontrol et
echo -e "${YELLOW}1️⃣2️⃣ Xcode workspace kontrol ediliyor...${NC}"
if [ -f "ios/BlueCrew.xcworkspace/contents.xcworkspacedata" ]; then
    echo -e "${GREEN}✅ Xcode workspace oluşturuldu${NC}"
else
    echo -e "${RED}❌ Xcode workspace bulunamadı${NC}"
    exit 1
fi
echo ""

echo ""
echo -e "${GREEN}🎉 Temizlik ve yeniden oluşturma tamamlandı!${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}            SONRAKİ ADIMLAR - 2 SEÇENEK            ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}SEÇENEK 1: Xcode ile Yerel Build (Detaylı Hata Logları İçin)${NC}"
echo -e "${BLUE}────────────────────────────────────────────────────────────${NC}"
echo "1. Xcode'u aç:"
echo "   open ios/BlueCrew.xcworkspace"
echo ""
echo "2. Xcode'da:"
echo "   • Üst bardan simulator/device seç (örn: iPhone 15)"
echo "   • Product > Clean Build Folder (Cmd+Shift+K)"
echo "   • Product > Build (Cmd+B)"
echo ""
echo "3. Eğer hata alırsanız:"
echo "   • Xcode'un sol panelindeki kırmızı hata ikonlarına tıklayın"
echo "   • Tam hata mesajını ve dosya yolunu kopyalayın"
echo "   • Bu bilgileri bana gönderin"
echo ""
echo ""
echo -e "${YELLOW}SEÇENEK 2: EAS CLI ile Cloud Build${NC}"
echo -e "${BLUE}────────────────────────────────────────────────────────────${NC}"
echo "1. EAS CLI ile login:"
echo "   eas login"
echo ""
echo "2. iOS build başlat:"
echo "   eas build --platform ios --profile production"
echo ""
echo "3. Build durumunu takip edin:"
echo "   • Terminal'de gösterilen URL'yi açın"
echo "   • Build logs'u inceleyin"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✨ Başarılar!${NC}"
echo ""
