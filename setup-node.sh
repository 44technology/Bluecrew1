#!/bin/bash

# Node.js Setup Script for iOS Build

echo "🔍 Node.js kurulumunu kontrol ediliyor..."

# Check if node exists in common locations
NODE_PATHS=(
  "/usr/local/bin/node"
  "/opt/homebrew/bin/node"
  "$HOME/.nvm/versions/node/*/bin/node"
  "$HOME/.volta/bin/node"
  "/usr/bin/node"
)

NODE_FOUND=""

for path in "${NODE_PATHS[@]}"; do
  if [ -f "$path" ] || ls $path 2>/dev/null | grep -q node; then
    NODE_FOUND="$path"
    break
  fi
done

if [ -n "$NODE_FOUND" ]; then
  echo "✅ Node.js bulundu: $NODE_FOUND"
  NODE_DIR=$(dirname "$NODE_FOUND")
  echo ""
  echo "📝 PATH'e eklemek için şu komutu çalıştırın:"
  echo "export PATH=\"$NODE_DIR:\$PATH\""
  echo ""
  echo "Veya kalıcı olarak ~/.zshrc dosyanıza ekleyin:"
  echo "echo 'export PATH=\"$NODE_DIR:\$PATH\"' >> ~/.zshrc"
else
  echo "❌ Node.js bulunamadı!"
  echo ""
  echo "Node.js kurmak için:"
  echo "1. Homebrew ile: brew install node"
  echo "2. NVM ile: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
  echo "3. Resmi site: https://nodejs.org/"
fi
