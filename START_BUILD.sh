#!/bin/bash

echo "🚀 iOS Production Build Başlatılıyor..."
echo ""

cd "$(dirname "$0")"

# New Architecture kontrolü
echo "✅ New Architecture ayarları kontrol ediliyor..."
if grep -q '"newArchEnabled": "true"' ios/Podfile.properties.json && grep -q '"newArchEnabled": true' app.json; then
  echo "   ✓ New Architecture etkin"
else
  echo "   ✗ New Architecture ayarları tutarsız!"
  exit 1
fi

# EAS CLI kontrolü
echo "✅ EAS CLI kontrol ediliyor..."
if ! command -v eas &> /dev/null; then
  echo "   ✗ EAS CLI bulunamadı. Lütfen kurun: npm install -g eas-cli"
  exit 1
fi
echo "   ✓ EAS CLI kurulu"

# Ağ bağlantısı kontrolü
echo "✅ Ağ bağlantısı kontrol ediliyor..."
if ping -c 1 -W 2 api.expo.dev &> /dev/null; then
  echo "   ✓ Expo API'ye erişilebilir"
else
  echo "   ⚠️  Expo API'ye erişilemiyor. İnternet bağlantınızı kontrol edin."
  echo "   Build'i tekrar denemek için: eas build --platform ios --profile production"
  exit 1
fi

# EAS oturum kontrolü
echo "✅ EAS oturum kontrol ediliyor..."
if eas whoami &> /dev/null; then
  echo "   ✓ EAS'e giriş yapılmış"
else
  echo "   ⚠️  EAS'e giriş yapılmamış. Giriş yapılıyor..."
  eas login
fi

# Build başlat
echo ""
echo "📦 Production build başlatılıyor..."
echo "   Bu işlem birkaç dakika sürebilir..."
echo ""

eas build --platform ios --profile production

echo ""
echo "✅ Build tamamlandı!"
echo ""
echo "Build durumunu kontrol etmek için:"
echo "  eas build:list --platform ios"
echo ""
echo "TestFlight'a yüklemek için:"
echo "  eas submit --platform ios --profile production"
