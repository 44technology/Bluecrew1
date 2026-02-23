# Netlify Auto-Deploy Tetiklenmiyor – Branch Ayarı

Repo **master** branch kullanıyor. Netlify’da “Production branch” **main** ise push’larda deploy tetiklenmez.

## 1. Netlify’da branch’i kontrol et

1. https://app.netlify.com → siteni seç (bluecrew-app)
2. **Site configuration** (veya **Build & deploy**)
3. **Continuous deployment** → **Build settings** (veya **Branch deploy settings**)
4. **Production branch** değerine bak:
   - **main** yazıyorsa → **master** yap
   - **Branch** alanında **master** seçip **Save** de

## 2. Build ayarlarını doğrula

Aynı sayfada:

- **Build command:** `npm run build:web` (veya boş bırak; `netlify.toml` kullanılır)
- **Publish directory:** `dist`
- **Base directory:** boş

## 3. Son deploy’u kontrol et

- **Deploys** sekmesine git
- Son deploy’un **branch**’i ne? (master olmalı)
- **Trigger** “Deploy from Git” mi yoksa “Manual deploy” mi?

## 4. Hâlâ tetiklenmiyorsa

- **Site configuration** → **Build & deploy** → **Build hooks**  
  İstersen “Build hook” oluştur; CI veya manuel tetiklemede kullanırsın.
- Veya her push sonrası manuel:  
  **Deploys** → **Trigger deploy** → **Deploy site**

## 5. Hızlı manuel deploy (şimdilik)

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npm run build:web
npx netlify-cli deploy --prod --dir=dist
```

En sık sebep: **Production branch = main** iken repo’da **master**’a push etmek. Branch’i **master** yapınca otomatik deploy çalışır.
