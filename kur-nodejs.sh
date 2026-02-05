#!/bin/bash

# Node.js Kurulum Scripti (NVM ile)
# Bu script NVM kullanarak Node.js LTS versiyonunu kurar

set -e

echo "🚀 Node.js Kurulum Başlatılıyor (NVM ile)..."
echo ""

# NVM kontrolü
if [ -d "$HOME/.nvm" ]; then
    echo "✅ NVM zaten kurulu"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
    echo "📦 NVM kuruluyor..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # NVM'i yükle
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    echo "✅ NVM kuruldu"
fi

echo ""

# Node.js LTS kurulumu
echo "📦 Node.js LTS versiyonu kuruluyor..."
nvm install --lts

echo ""

# Varsayılan versiyonu ayarla
echo "⚙️  Varsayılan Node.js versiyonu ayarlanıyor..."
nvm use --default

echo ""
echo "✅ Node.js kurulumu tamamlandı!"
echo ""
echo "📊 Kurulum Bilgileri:"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo "   NVM: $(nvm --version)"
echo ""

# ~/.zshrc kontrolü
if ! grep -q "NVM_DIR" ~/.zshrc 2>/dev/null; then
    echo "📝 ~/.zshrc dosyasına NVM ayarları ekleniyor..."
    echo '' >> ~/.zshrc
    echo '# NVM' >> ~/.zshrc
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc
    echo "✅ ~/.zshrc güncellendi"
    echo ""
    echo "⚠️  ÖNEMLİ: Terminal'i kapatıp yeniden açın veya şu komutu çalıştırın:"
    echo "   source ~/.zshrc"
    echo ""
fi

echo "🎉 Kurulum başarılı!"
echo ""
echo "Sonraki adımlar:"
echo "1. Terminal'i yeniden başlatın (veya: source ~/.zshrc)"
echo "2. Proje dizinine gidin: cd $(pwd)"
echo "3. Bağımlılıkları yükleyin: npm install"
echo "4. iOS build için: ./build-and-test-ios.sh"
