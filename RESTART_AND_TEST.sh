#!/bin/bash

echo "🔄 Metro Bundler'ı Tamamen Temizleme ve Yeniden Başlatma"
echo "=========================================================="
echo ""

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo -e "${YELLOW}1️⃣ Metro bundler'ı durdurun (başka terminal'de Ctrl+C ile)${NC}"
echo -e "${BLUE}   Bu script devam etmeden önce Metro'yu kapatın!${NC}"
read -p "Metro durduruldu mu? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Metro'yu önce durdurun!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}2️⃣ Watchman cache temizleniyor...${NC}"
if command -v watchman &> /dev/null; then
    watchman watch-del-all
    echo -e "${GREEN}✅ Watchman cache temizlendi${NC}"
else
    echo -e "${BLUE}ℹ️  Watchman yüklü değil (sorun değil)${NC}"
fi

echo ""
echo -e "${YELLOW}3️⃣ Metro bundler cache temizleniyor...${NC}"
rm -rf node_modules/.cache 2>/dev/null || true
echo -e "${GREEN}✅ Metro cache temizlendi${NC}"

echo ""
echo -e "${YELLOW}4️⃣ Temp dosyalar temizleniyor...${NC}"
rm -rf .expo 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
echo -e "${GREEN}✅ Temp dosyalar temizlendi${NC}"

echo ""
echo -e "${GREEN}🎉 Temizlik tamamlandı!${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          SONRAKI ADIMLAR          ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}5️⃣ Metro bundler'ı cache temizleyerek başlatın:${NC}"
echo "   npx expo start -c"
echo ""
echo -e "${YELLOW}6️⃣ Simulator'de:${NC}"
echo "   • Uygulamayı TAMAMEN KAPATIN (Home'a çık, yukarı kaydır, kill et)"
echo "   • Metro terminalde 'i' tuşuna basın"
echo ""
echo -e "${YELLOW}7️⃣ Test:${NC}"
echo "   • Hamburger menüyü aç"
echo "   • Scroll indicator görünüyor mu? (sağda ince çizgi)"
echo "   • Scroll çalışıyor mu?"
echo ""
echo -e "${GREEN}✨ Şimdi başka terminalde: npx expo start -c${NC}"
echo ""
