# Notifications Index Kurulum Rehberi

Notifications sayfasında Firebase index hatası alınıyor. Firebase Firestore'da composite index gerekiyor.

## Hızlı Çözüm

### Yöntem 1: Hata Mesajındaki Link (En Hızlı) ⭐

Hata mesajındaki link'e tıklayın:
```
https://console.firebase.google.com/v1/r/project/bluecrew-app/firestore/indexes?create_composite=...
```

Bu link otomatik olarak index oluşturma sayfasına yönlendirir. "Create Index" butonuna tıklayın.

### Yöntem 2: Firebase CLI ile Deploy

```bash
# Firebase CLI kurulu değilse
npm install -g firebase-tools

# Firebase'e login
firebase login

# Index'leri deploy et
firebase deploy --only firestore:indexes
```

## Index Detayları

**Collection:** `notifications`
**Fields:**
1. `user_id` - Ascending
2. `created_at` - Descending

## Index Durumu

Index oluşturulduktan sonra:
- **Building:** Index oluşturuluyor (birkaç dakika sürebilir)
- **Enabled:** Index hazır ve kullanılabilir

## Yapılan Değişiklik

✅ `firestore.indexes.json` dosyasına notifications index'i eklendi

## Sorun Giderme

### Index Hala Building Durumunda

- Index oluşturma işlemi birkaç dakika sürebilir
- Collection'da çok fazla veri varsa daha uzun sürebilir
- Bekleyin, otomatik olarak "Enabled" durumuna geçecektir

### Hata Devam Ediyor

1. **Index'in oluşturulduğundan emin olun:**
   - Firebase Console > Firestore > Indexes
   - `notifications` collection'ında index'in "Enabled" olduğunu kontrol edin

2. **Uygulamayı yeniden başlatın:**
   - Metro bundler'ı durdurun (Ctrl + C)
   - Tekrar başlatın: `npm run dev`
   - Simulator'de uygulamayı yenileyin (⌘ + R)

3. **Cache temizleme:**
   ```bash
   npm run dev -- --reset-cache
   ```

## Özet

1. ✅ Hata mesajındaki link'e tıklayın VEYA
2. ✅ `firebase deploy --only firestore:indexes` çalıştırın
3. ✅ Index'in "Enabled" durumuna gelmesini bekleyin (1-5 dakika)
4. ✅ Uygulamayı yenileyin

Index hazır olduğunda hata kaybolacaktır!
