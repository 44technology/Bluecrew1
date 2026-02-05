# Terminal'de Çalıştırılacak Komutlar

Bu komutları **kendi terminal pencerenizde** sırayla çalıştırın:

## Adım 1: npm Cache İzin Sorununu Düzelt

```bash
sudo chown -R $(whoami) ~/.npm
```

Şifrenizi girmeniz istenecek.

## Adım 2: npm Prefix Ayarla

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
```

## Adım 3: PATH'e Ekle (Kalıcı)

```bash
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

## Adım 4: İnternet Bağlantısını Test Et

```bash
ping -c 3 google.com
```

Eğer ping çalışıyorsa devam edin. Çalışmıyorsa internet bağlantınızı kontrol edin.

## Adım 5: EAS CLI Kur

```bash
npm install -g eas-cli
```

## Adım 6: EAS CLI Kontrolü

```bash
eas --version
```

Eğer versiyon görünüyorsa kurulum başarılı!

## Adım 7: EAS'a Giriş Yap

```bash
eas login
```

Expo hesabınızla giriş yapın (yoksa ücretsiz oluşturun: https://expo.dev)

## Adım 8: Build Başlat

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project
npm run build:ios
```

veya direkt:

```bash
eas build --platform ios --profile production
```

---

## Sorun Giderme

### Eğer "command not found: eas" hatası alırsanız:

```bash
export PATH=~/.npm-global/bin:$PATH
eas --version
```

### Eğer internet bağlantısı sorunu devam ederse:

1. VPN kullanıyorsanız kapatıp tekrar deneyin
2. WiFi'yi kapatıp açın
3. Farklı bir ağ deneyin
4. Sistem Ayarları > Ağ'dan DNS ayarlarını kontrol edin

### Alternatif: npx ile (internet gerektirir)

```bash
cd /Users/danielamartinez/Documents/bluecrew1/project
npx eas-cli login
npx eas-cli build --platform ios --profile production
```
