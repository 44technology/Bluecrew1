# Development'da Test Etme

Önce development ortamında sorunsuz çalıştığını doğrula, sonra production/TestFlight’a geç.

---

## Seçenek 1: Web’de hızlı test (en az bağımlılık)

Simulator/CocoaPods gerektirmez, tarayıcıda açar:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx expo start --web
```

Tarayıcıda açılan adres (genelde http://localhost:8081) üzerinden uygulamayı test et. Giriş, sayfalar, temel akışlar çalışıyorsa development tarafı sağlam demektir.

---

## Seçenek 2: iOS Simulator’da test

### Önkoşullar

1. **Xcode** yüklü ve komut satırı araçları seçili:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

2. **CocoaPods** yüklü ve PATH’te:
   ```bash
   which pod   # bir path dönmeli
   # Yoksa: sudo gem install cocoapods
   ```

3. **Port 8081** boş olmalı. Başka uygulama (örn. HealthApp) kullanıyorsa farklı port:
   ```bash
   npx expo start --port 8082
   ```

### Adımlar

**A) Pod’ları kur (ilk kez veya ios değiştiyse)**

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project/ios
pod install
cd ..
```

**B) Workspace’i Xcode’da aç**

```bash
open ios/BlueCrew.xcworkspace
```

(.xcworkspace yoksa önce `pod install` yaptığınızdan emin olun.)

**C) Metro’yu ayrı terminalde başlat**

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx expo start --port 8082
```

(Port 8081 meşgulse 8082 kullanın.)

**D) Xcode’da çalıştır**

- Scheme: **BlueCrew**
- Cihaz: **iPhone Simulator** (örn. iPhone 15)
- **⌘ + R** (Run)

Simulator açılır, uygulama Metro’dan JS alır. Giriş, projeler, ayarlar vb. test et.

---

## Seçenek 3: Tek komutla iOS (CocoaPods + Xcode hazırsa)

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx expo run:ios --port 8082
```

Bu komut `pod install` + build + simulator’da açar. Port 8081 doluysa `--port 8082` kullanın.

---

## Önerilen sıra

1. **Web’de test et:** `npx expo start --web` → Temel akışlar çalışıyor mu?
2. **iOS’ta test et:** Yukarıdaki Seçenek 2 veya 3 → Simulator’da sorun var mı?
3. Sorun yoksa **production build** ve TestFlight’a geç.

---

## Sık hatalar

| Hata | Çözüm |
|------|--------|
| `pod: command not found` | `sudo gem install cocoapods` veya Ruby/pod PATH’i düzelt |
| `Port 8081 in use` | `npx expo start --port 8082` (ve gerekirse Xcode’da bundler URL’i 8082 yapın) |
| `Simulator is most likely not installed` | `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` |
| `No development build installed` | `npx expo run:ios` ile önce build alın veya Xcode’dan Run edin |
