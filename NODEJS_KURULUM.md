# Node.js Kurulum Rehberi (macOS)

macOS'ta Node.js kurmanın 3 farklı yöntemi var. Size en uygun olanı seçin.

## Yöntem 1: NVM ile Kurulum (ÖNERİLEN) ⭐

NVM (Node Version Manager) ile farklı Node.js versiyonlarını yönetebilirsiniz. En esnek yöntem.

### Adımlar:

```bash
# 1. NVM'i kur
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Terminal'i yeniden başlat veya şu komutu çalıştır
source ~/.zshrc

# 3. Node.js LTS (Long Term Support) versiyonunu kur
nvm install --lts

# 4. Kurulumu kontrol et
node --version
npm --version
```

### Avantajları:
- ✅ Farklı Node.js versiyonları arasında geçiş yapabilirsiniz
- ✅ Projeler için farklı versiyonlar kullanabilirsiniz
- ✅ Kolay güncelleme
- ✅ Sistem Node.js'ini etkilemez

---

## Yöntem 2: Homebrew ile Kurulum

Homebrew macOS için popüler bir paket yöneticisidir.

### Adımlar:

```bash
# 1. Homebrew'i kur (eğer yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Homebrew'i PATH'e ekle (Apple Silicon Mac için)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

# 3. Node.js'i kur
brew install node

# 4. Kurulumu kontrol et
node --version
npm --version
```

### Avantajları:
- ✅ Homebrew ile diğer araçları da kolayca kurabilirsiniz
- ✅ Sistem genelinde kurulum
- ✅ Otomatik güncellemeler

---

## Yöntem 3: Resmi Installer (En Kolay)

Node.js'in resmi web sitesinden installer indirip kurun.

### Adımlar:

1. **Web sitesine git:**
   https://nodejs.org/

2. **LTS versiyonunu indir:**
   - "LTS" (Long Term Support) etiketli versiyonu seçin
   - `.pkg` dosyasını indirin

3. **Kurulum:**
   - İndirilen `.pkg` dosyasına çift tıklayın
   - Kurulum sihirbazını takip edin
   - Kurulum tamamlandıktan sonra terminal'i yeniden başlatın

4. **Kontrol:**
   ```bash
   node --version
   npm --version
   ```

### Avantajları:
- ✅ En kolay yöntem
- ✅ Grafik arayüz
- ✅ Hızlı kurulum

---

## Hızlı Kurulum (NVM - Önerilen)

Terminal'de şu komutları sırayla çalıştırın:

```bash
# NVM kur
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Terminal'i yeniden yükle
source ~/.zshrc

# Node.js LTS kur
nvm install --lts

# Varsayılan versiyonu ayarla
nvm use --default

# Kontrol
node --version
npm --version
```

---

## Kurulum Sonrası

Node.js kurulduktan sonra:

1. **Proje bağımlılıklarını yükle:**
   ```bash
   cd /Users/info44technology.com/Desktop/bluecrew1/project
   npm install
   ```

2. **iOS build ve test:**
   ```bash
   ./build-and-test-ios.sh
   ```

---

## Sorun Giderme

### "command not found: node" hatası
- Terminal'i kapatıp yeniden açın
- `source ~/.zshrc` komutunu çalıştırın

### NVM kurulumu sonrası çalışmıyor
```bash
# ~/.zshrc dosyasına NVM eklenmiş mi kontrol et
cat ~/.zshrc | grep nvm

# Eğer yoksa manuel ekle
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
```

### Versiyon kontrolü
```bash
# Node.js versiyonu
node --version

# npm versiyonu
npm --version

# NVM ile kurulu versiyonlar
nvm list
```

---

## Önerilen Versiyon

- **Node.js:** v20.x LTS veya v22.x LTS
- **npm:** Node.js ile birlikte gelir

Bu proje için Node.js 18+ gereklidir, LTS versiyonu yeterlidir.
