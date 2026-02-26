# Uygulamayı Yayınlama ve Domain'e Taşıma

## 1. Netlify'da Yayın (Mevcut Yol)

### İlk deploy
```bash
npm run build:web
netlify login
netlify init   # veya mevcut site seç
netlify deploy --prod --dir=dist
```

Bu adımlardan sonra uygulama `https://[site-adi].netlify.app` adresinde yayında olur.

---

## 2. Kendi Domain'inizi Netlify'a Bağlama (Netlify Link → Domain)

**Netlify kullanmaya devam edebilirsiniz;** sadece adresi kendi domain'inize taşırsınız.

### Adımlar

1. **Netlify Dashboard**
   - https://app.netlify.com → Sitenizi seçin  
   - **Domain management** (veya **Domain settings**) bölümüne girin.

2. **Custom domain ekleme**
   - **Add custom domain** / **Add domain alias** tıklayın.
   - Domain'inizi yazın: `uygulama.sirket.com` veya `www.sirket.com` veya `sirket.com`.

3. **DNS ayarları (domain sağlayıcınızda)**

   Netlify size iki seçenek gösterir:

   **A) Netlify DNS kullanırsanız (en kolay)**  
   - Domain’i Netlify’a taşıyın (Netlify’da “Transfer DNS to Netlify” / “Use Netlify DNS”).
   - Netlify gerekli kayıtları kendisi ekler, ekstra bir şey yapmanız gerekmez.

   **B) Mevcut DNS’te kalırsanız**  
   Domain sağlayıcınızda (GoDaddy, Namecheap, Cloudflare, vs.) şunları yapın:

   - **Kök domain için (sirket.com):**
     - Tip: **A**
     - Host: `@`
     - Değer: `75.2.60.5` (Netlify’un load balancer IP’si; Netlify panelinde güncel adresi gösterir).

   - **Alt domain veya www için (www.sirket.com veya app.sirket.com):**
     - Tip: **CNAME**
     - Host: `www` veya `app` (kullandığınız alt alan adı)
     - Değer: `[site-adi].netlify.app`

4. **SSL (HTTPS)**  
   Netlify, Let’s Encrypt ile otomatik SSL verir. Domain doğrulandıktan sonra birkaç dakika–birkaç saat içinde `https://` açılır.

### Özet
- Netlify link’i (**xyz.netlify.app**) kullanmaya devam edebilirsiniz.
- İsterseniz **sadece adresi** kendi domain’inize taşırsınız; hosting yine Netlify’da kalır.
- **Netlify’u kullanmak zorunda değilsiniz**; aşağıda alternatifler var.

---

## 3. Netlify Kullanmak Zorunda mısınız?

**Hayır.** Uygulama statik web (HTML/JS/CSS) ürettiği için aynı build’i başka bir yere de koyabilirsiniz.

### Alternatifler

| Platform        | Avantaj                          | Build / Publish                    |
|----------------|-----------------------------------|------------------------------------|
| **Vercel**     | Ücretsiz tier, otomatik HTTPS    | `npm run build:web` → `vercel --prod` (output: `dist`) |
| **Cloudflare Pages** | Hızlı CDN, ücretsiz tier   | Git bağla veya `dist` upload      |
| **GitHub Pages**    | Ücretsiz, GitHub ile entegre  | `dist` içeriğini `gh-pages` branch’e push |
| **Kendi sunucunuz** | Tam kontrol, kendi domain’iniz | `dist` klasörünü Nginx/Apache ile servis edin |

### Aynı build’i kullanma
Tüm bu seçeneklerde:
1. `npm run build:web` çalıştırın → `dist` klasörü oluşur.
2. Bu `dist` içeriğini ilgili platforma yüklersiniz (veya Git ile otomatik deploy ayarlarsınız).

Yani **domain’i nereye taşırsanız taşıyın**, uygulama aynı; sadece “nereye deploy ettiğiniz” değişir.

---

## 4. Domain’i Başka Bir Yere Taşımak (Netlify’dan Çıkmak)

1. **Yeni host’u seçin** (Vercel, Cloudflare Pages, kendi sunucu, vb.).
2. **DNS’i güncelleyin:** Domain’in A/CNAME kayıtlarını **yeni host’un verdiği adrese** yönlendirin (Netlify IP/CNAME’i kaldırın).
3. **Yeni host’ta** `dist` ile deploy alın veya Git bağlayıp build komutunu `npm run build:web`, publish’i `dist` yapın.

Böylece aynı domain’i kullanmaya devam eder, sadece arka plandaki servis Netlify’dan çıkmış olur.

---

## Kısa Özet

- **Netlify link’i kullanmak:** Deploy alın, `*.netlify.app` adresiyle yayında olursunuz.
- **Kendi domain’inizi kullanmak (Netlify’da kalarak):** Netlify’da “Add custom domain” + DNS’te A/CNAME ayarı.
- **Netlify zorunlu değil:** `dist` çıktısını Vercel, Cloudflare Pages veya kendi sunucunuza da koyabilirsiniz; domain’i o servise göre DNS’te yönlendirirsiniz.
