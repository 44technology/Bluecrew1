# Netlify Deploy Rehberi

## Durum
✅ Web build tamamlandı (`dist` klasörü hazır)
⏳ Netlify login bekleniyor

## Deploy Adımları

### Yöntem 1: Netlify CLI ile (Önerilen)

1. **Netlify'a Login:**
   Terminal'de şu komutu çalıştırın:
   ```bash
   cd /Users/aliakda/Desktop/bluecrew1/project
   netlify login
   ```
   Tarayıcı açılacak, Netlify hesabınızla giriş yapın.

2. **Site Bağlama (İlk kez):**
   ```bash
   netlify init
   ```
   Mevcut site seçin veya yeni site oluşturun.

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Yöntem 2: Netlify Dashboard ile

1. https://app.netlify.com adresine gidin
2. Sites bölümünden sitenizi seçin
3. "Deploys" sekmesine gidin
4. "Add new site" > "Deploy manually" seçin
5. `dist` klasörünü sürükleyip bırakın veya zip olarak yükleyin

### Yöntem 3: Git ile Otomatik Deploy

Eğer projeniz Git'te ise:
1. Netlify Dashboard > Site settings > Build & deploy
2. "Continuous Deployment" bölümünde Git provider'ı bağlayın
3. Her push'ta otomatik deploy olur

## Hızlı Komutlar

```bash
# Login
netlify login

# Site durumu kontrol
netlify status

# Production deploy
netlify deploy --prod --dir=dist

# Preview deploy (test için)
netlify deploy --dir=dist
```

## Build Klasörü

Build klasörü: `/Users/aliakda/Desktop/bluecrew1/project/dist`

Bu klasör Netlify'a deploy edilecek.

## Notlar

- Build zaten tamamlandı, sadece deploy kaldı
- Netlify login yapıldıktan sonra deploy çok hızlı (1-2 dakika)
- Production deploy için `--prod` flag'i kullanın
