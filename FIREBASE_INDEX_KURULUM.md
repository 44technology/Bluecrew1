# Firebase Index Kurulum Rehberi

Proposals koleksiyonunda `client_name` + `created_at` ile sorgu (Clients, Invoice detay vb.) için composite index gerekiyor.

**Not:** Uygulama index yokken de çalışır (yedek sorgu ile). Index oluşturmanız sorguları hızlandırır ve önerilir.

## Otomatik Kurulum (Önerilen)

### 1. Firebase CLI ile Deploy

```bash
# Firebase CLI kurulu değilse
npm install -g firebase-tools

# Firebase'e login
firebase login

# Index'leri deploy et
firebase deploy --only firestore:indexes
```

## Manuel Kurulum

### 1. Firebase Console'dan

1. **Firebase Console'a gidin:**
   https://console.firebase.google.com/project/bluecrew-app/firestore/indexes

2. **Hata mesajındaki link'i kullanın:**
   Hata mesajında verilen link'e tıklayın - otomatik olarak index oluşturma sayfasına yönlendirilirsiniz.

3. **Veya manuel oluşturun:**
   - "Create Index" butonuna tıklayın
   - Collection ID: `proposals`
   - Fields:
     - `client_name` (Ascending)
     - `created_at` (Descending)
   - "Create" butonuna tıklayın

### 2. Index Oluşturma Detayları

**Collection:** `proposals`
**Fields:**
1. `client_name` - Ascending
2. `created_at` - Descending

## Index Durumu

Index oluşturulduktan sonra:
- **Building:** Index oluşturuluyor (birkaç dakika sürebilir)
- **Enabled:** Index hazır ve kullanılabilir

## Sorun Giderme

### Index Hala Building Durumunda

- Index oluşturma işlemi birkaç dakika sürebilir
- Collection'da çok fazla veri varsa daha uzun sürebilir
- Bekleyin, otomatik olarak "Enabled" durumuna geçecektir

### Hata Devam Ediyor

1. **Index'in oluşturulduğundan emin olun:**
   - Firebase Console > Firestore > Indexes
   - `proposals` collection'ında index'in "Enabled" olduğunu kontrol edin

2. **Uygulamayı yeniden başlatın:**
   - Metro bundler'ı durdurun (Ctrl + C)
   - Tekrar başlatın: `npm run dev`
   - Simulator'de uygulamayı yenileyin (⌘ + R)

3. **Cache temizleme:**
   ```bash
   npm run dev -- --reset-cache
   ```

## Gelecek İçin

Yeni index'ler gerektiğinde:
1. `firestore.indexes.json` dosyasına ekleyin
2. `firebase deploy --only firestore:indexes` çalıştırın

Bu şekilde tüm index'ler version control'de tutulur ve takım üyeleriyle paylaşılır.
