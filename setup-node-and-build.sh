#!/bin/bash

# Node.js Kurulum ve iOS Build Script

set -e

echo "🔧 Node.js Kurulum ve iOS Build Hazırlığı"
echo ""

# Homebrew kontrolü
if command -v brew &> /dev/null; then
    echo "✅ Homebrew bulundu"
    echo ""
    echo "Node.js kurmak için:"
    echo "  brew install node"
    echo ""
    read -p "Node.js'i şimdi kurmak ister misiniz? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install node
        echo ""
        echo "✅ Node.js kuruldu!"
        echo "Terminal'i yeniden başlatın veya şu komutu çalıştırın:"
        echo "  source ~/.zshrc"
    fi
else
    echo "📦 Homebrew bulunamadı"
    echo ""
    echo "Homebrew kurmak için:"
    echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo ""
    echo "Veya Node.js'i başka yollarla kurabilirsiniz:"
    echo "1. NVM: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "2. Resmi site: https://nodejs.org/"
fi

echo ""
echo "Node.js kurulduktan sonra:"
echo "  ./build-and-test-ios.sh"
echo "komutunu çalıştırın."
