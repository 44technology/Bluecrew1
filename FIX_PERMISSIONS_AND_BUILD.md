# İzin Sorununu Çözme ve iOS Build

## Sorun
npm global kurulum için izin hatası alıyorsunuz.

## Çözüm 1: npm Prefix Ayarlama (ÖNERİLEN)

Terminal'de şu komutları çalıştırın:

```bash
# 1. npm global dizinini kullanıcı dizinine taşı
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# 2. PATH'e ekle (kalıcı için)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# 3. Mevcut terminal için aktif et
export PATH=~/.npm-global/bin:$PATH

# 4. EAS CLI kur
npm install -g eas-cli

# 5. EAS'a giriş yap
eas login

# 6. Build başlat
cd /Users/danielamartinez/Documents/bluecrew1/project
npm run build:ios
```

## Çözüm 2: npx ile Direkt Kullanma (Global Kurulum Gerektirmez)

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# npx ile direkt kullan (her seferinde indirir, yavaş)
npx eas-cli login
npx eas-cli build --platform ios --profile production
```

## Çözüm 3: Proje İçinde Lokal Kurulum

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project

# Proje içinde lokal kur
npm install eas-cli --save-dev

# npx ile kullan
npx eas login
npx eas build --platform ios --profile production
```

## Çözüm 4: Sudo ile Kurulum (Güvenlik Açısından Önerilmez)

```bash
sudo npm install -g eas-cli
```

⚠️ **Not:** Sudo kullanmak güvenlik riski oluşturabilir.

## Önerilen Yöntem

**Çözüm 1** en iyisidir. Terminal'de şu komutları sırayla çalıştırın:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g eas-cli
eas login
cd /Users/danielamartinez/Documents/bluecrew1/project
npm run build:ios
```
