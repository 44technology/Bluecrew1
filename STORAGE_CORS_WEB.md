# Firebase Storage CORS – Web’de Yükleme Hatası Çözümü

Web’de (Netlify veya localhost) doküman yüklerken şu hata alınıyorsa:

```
FirebaseError: Firebase Storage: An unknown error occurred, please check the error payload for server response. (storage/unknown)
```

Bu genelde **Storage bucket’ta CORS ayarının yapılmamış olmasından** kaynaklanır. Tarayıcı, farklı bir origin’den (örn. `https://bluecrew-app.netlify.app`) Storage’a istek attığı için sunucunun CORS başlıkları dönmesi gerekir.

## Çözüm: CORS’u bucket’a uygulayın

### 1. Google Cloud SDK (gsutil) kurulu olsun

- İndir: https://cloud.google.com/sdk/docs/install  
- veya Homebrew (Mac): `brew install google-cloud-sdk`
- Kurulumdan sonra: `gcloud auth login` ve projeyi seçin: `gcloud config set project bluecrew-app`

### 2. Bucket’a CORS ayarını verin

Proje kökündeki `cors.json` zaten doğru origin’leri içeriyor. Aynı bucket’a uygulamak için:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
gsutil cors set cors.json gs://bluecrew-app.firebasestorage.app
```

### 3. Kontrol edin

```bash
gsutil cors get gs://bluecrew-app.firebasestorage.app
```

Çıktıda `cors.json` içeriğiniz görünmeli.

### 4. Web’de tekrar deneyin

Netlify veya localhost’ta sayfayı yenileyip doküman yüklemeyi tekrar deneyin. CORS ayarı doğruysa hata kaybolur.

---

## cors.json içeriği

`cors.json` şu origin’lere izin veriyor:

- `https://bluecrew-app.netlify.app`
- `http://localhost:8081`, `http://localhost:19006`, `http://localhost:3000`

Yeni bir domain (örn. başka bir Netlify site) eklerseniz `cors.json`’a ekleyip komutu tekrar çalıştırın.

---

## Not

- CORS, **Firebase Console’dan** ayarlanmaz; sadece **gsutil** (veya Google Cloud Console’da bucket > Permissions / CORS) ile yapılır.
- Değişiklik birkaç dakika içinde geçerli olur; bazen birkaç yenileme gerekebilir.
