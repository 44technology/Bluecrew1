# Özel Domain'e Geçiş Adımları

Netlify’da şu an `*.netlify.app` kullanıyorsunuz. Kendi domain’inizi (örn. `app.sirketiniz.com`) kullanmak için aşağıdakileri uygulayın.

---

## 1. Netlify’da domain ekleme

1. **https://app.netlify.com** → Sitenizi seçin (örn. bluecrew-app).
2. **Domain management** (veya **Domain settings**) → **Add custom domain** / **Add domain alias**.
3. Özel domain’inizi yazın: `app.sirketiniz.com` veya `www.sirketiniz.com` veya `sirketiniz.com`.
4. Netlify domain’i doğrulamaya çalışacak; henüz DNS’i yapmadıysanız “DNS’i yapılandırın” benzeri bir mesaj görürsünüz. Devam için **2. adıma** geçin.

---

## 2. DNS ayarları (domain’i aldığınız yerde)

Domain’i nereden aldıysanız (GoDaddy, Namecheap, Cloudflare, Google Domains, vb.) orada DNS bölümüne girin.

### Kök domain için (sirketiniz.com)

| Tip  | Host / Ad | Değer        |
|------|-----------|--------------|
| **A** | `@`       | `75.2.60.5`  |

(Netlify bazen farklı bir IP verebilir; Netlify ekranındaki “A record” değerini kullanın.)

### www veya alt domain için (www.sirketiniz.com veya app.sirketiniz.com)

| Tip    | Host / Ad | Değer                    |
|--------|-----------|---------------------------|
| **CNAME** | `www` veya `app` | `bluecrew-app.netlify.app` |

(Site adınız farklıysa Netlify’da yazan `*.netlify.app` adresini yazın.)

Kayıtların yayılması 5 dakika – 48 saat sürebilir. Netlify, domain doğrulandığında otomatik **HTTPS (SSL)** verir.

---

## 3. Uygulamada özel domain’i kullanma

Kodda web adresi tek bir yerden geliyor: `constants/app.ts`. Özel domain’i burada kullanmak için iki yol var.

### A) Ortam değişkeni (önerilen)

Netlify’da:

1. **Site settings** → **Environment variables** → **Add a variable**.
2. **Key:** `EXPO_PUBLIC_APP_URL`  
   **Value:** `https://app.sirketiniz.com` (kendi domain’iniz).
3. Deploy’u yenileyin (ör. bir commit push veya “Trigger deploy”).

Yerel geliştirme için proje kökünde `.env` oluşturabilirsiniz (git’e eklemeyin):

```
EXPO_PUBLIC_APP_URL=https://app.sirketiniz.com
```

### B) Doğrudan sabit değer

`constants/app.ts` içinde `APP_URL` satırını kendi domain’inizle değiştirin:

```ts
export const APP_URL = 'https://app.sirketiniz.com';
```

Bundan sonra lead’den client’a dönüşte gösterilen “Login URL” ve benzeri tüm linkler bu domain’i kullanır.

---

## 4. Firebase’de özel domain’i tanıma

### Auth (giriş / e-posta linkleri)

1. **Firebase Console** → Projeniz → **Authentication** → **Settings** (veya **Sign-in method** sayfasındaki “Authorized domains”).
2. **Authorized domains** listesine özel domain’inizi ekleyin: `app.sirketiniz.com` (www kullanıyorsanız `www.sirketiniz.com` da ekleyin).

### Storage CORS (dosya yükleme)

Firebase Storage kullanıyorsanız CORS’ta da yeni domain olmalı.

1. `cors.json` dosyasını açın.
2. `origin` dizisine özel domain’inizi ekleyin. Örnek:

```json
[
  {
    "origin": [
      "https://bluecrew-app.netlify.app",
      "https://app.sirketiniz.com",
      "http://localhost:8081",
      "http://localhost:19006",
      "http://localhost:3000"
    ],
    "method": ["GET","POST","PUT","DELETE","HEAD","OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type","Authorization","Content-Length","x-goog-resumable"]
  }
]
```

3. Firebase’e CORS’u uygulayın (Google Cloud’da gsutil gerekir):

```bash
gsutil cors set cors.json gs://[BUCKET_ADI].appspot.com
```

(Bucket adı Firebase Console → Storage’da görünür.)

---

## 5. Kontrol listesi

- [ ] Netlify’da custom domain eklendi.
- [ ] DNS’te A veya CNAME kayıtları doğru ve yayıldı.
- [ ] Netlify’da site “HTTPS” olarak açılıyor.
- [ ] `EXPO_PUBLIC_APP_URL` (veya `constants/app.ts`) özel domain ile güncellendi ve yeniden deploy edildi.
- [ ] Firebase Auth → Authorized domains’e özel domain eklendi.
- [ ] Firebase Storage kullanılıyorsa `cors.json` güncellendi ve `gsutil cors set` yapıldı.

Bu adımlardan sonra uygulama özel domain linki ile çalışır; Netlify adresi isteğe bağlı olarak yönlendirme (redirect) ile özel domain’e yönlendirilebilir.
