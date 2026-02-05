#!/bin/bash

# Build Başlatma Scripti

set -e

cd "$(dirname "$0")"

# PATH'e EAS CLI ekle
export PATH=~/.npm-global/bin:$PATH

echo "🚀 iOS Build Başlatılıyor..."
echo ""

# EAS login kontrolü
if ! eas whoami &> /dev/null; then
    echo "⚠️  EAS'a giriş yapmanız gerekiyor"
    eas login
fi

echo "☁️  Cloud build başlatılıyor..."
eas build --platform ios --profile production

echo ""
echo "✅ Build başlatıldı!"
echo "📱 Durumu kontrol etmek için: eas build:list --platform ios --limit 1"
