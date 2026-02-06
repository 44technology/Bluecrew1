# Xcode'da Projeyi Çalıştırma

## Simulator'da son değişiklikleri test etmek (önerilen sıra)

1. **Metro'yu başlat** (bir terminal):
   ```bash
   cd /Users/info44technology.com/Desktop/bluecrew1/project
   npm start
   ```
   Açılan pencerede **i** tuşuna basarak iOS simülatörü açabilirsin; veya Xcode’dan Run yapacaksan Metro’yu açık bırak.

2. **Xcode’da çalıştır:**
   - `open -a Xcode ios/BlueCrew.xcworkspace`
   - Üstte Scheme: **BlueCrew**, cihaz: bir **iPhone Simulator** seçin.
   - **⌘ + R** (Run).

3. **Test et:**
   - **Proposals:** Sağ altta yuvarlak **+** (FAB) ile Create Proposal açılıyor mu, Category / Client / Work Title listeleri açılıyor mu?
   - **Projects:** Create Project → Category, Select Clients, Select Work Title listeleri açılıyor mu?

Hata görürsen Xcode veya Metro terminalindeki mesajı not alıp düzeltebiliriz; sonra push edip yayınlarsın.

---

## 1. Workspace'i aç

**Mutlaka `.xcworkspace` açın, `.xcodeproj` değil** (CocoaPods kullanıldığı için).

Terminal'den:
```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
open -a Xcode ios/BlueCrew.xcworkspace
```

Veya Finder'dan: `ios` klasörüne girip **BlueCrew.xcworkspace** dosyasına çift tıklayın.

---

## 2. Scheme ve cihaz seç

1. **Scheme:** Sol üstte **BlueCrew** seçili olsun.
2. **Cihaz:** Hemen yanındaki cihaz menüsünden bir **iPhone Simulator** seçin (örn. iPhone 15, iPhone 16).

---

## 3. Çalıştır

- **⌘ + R** (Cmd + R)  
veya menüden **Product → Run**.

İlk build birkaç dakika sürebilir. Bitince simülatör açılır ve uygulama yüklenir.

---

## 4. Metro Bundler (gerekirse)

Expo/React Native projesi olduğu için JS kodu Metro’dan gelir. Xcode’dan Run yaptığınızda Metro otomatik başlamıyorsa, **ayrı bir terminal**de:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx expo start
```

Simülatörde uygulama açıkken Metro’yu başlatırsanız genelde otomatik bağlanır. Bağlanmazsa simülatörde **Device → Shake** (⌘ + Ctrl + Z) ile dev menüsünden bundler adresini girebilirsiniz.

---

## 5. Release (production) modda çalıştırmak

Xcode’da sol üstte scheme’in yanındaki **BlueCrew**’e tıklayın → **Edit Scheme** → **Run** sol menüde → **Build Configuration**: **Release** seçin → Close. Sonra tekrar **⌘ + R**.

---

## Kısa özet

| Adım | Ne yapılır |
|------|------------|
| 1 | `open -a Xcode ios/BlueCrew.xcworkspace` |
| 2 | Scheme: **BlueCrew**, Cihaz: **iPhone Simulator** |
| 3 | **⌘ + R** (Product → Run) |
| 4 | Gerekirse başka terminalde: `npx expo start` |

---

## Sık karşılaşılanlar

**Build failed**
- **Product → Clean Build Folder** (⇧⌘K), sonra tekrar **⌘ + R**.

**Pod hatası**
```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project/ios
pod install
```
Sonra Xcode’u kapatıp `ios/BlueCrew.xcworkspace` ile tekrar açın.

**Uygulama açılıyor ama ekran boş / kırmızı hata**
- Aynı makinede Metro’nun çalıştığından emin olun: `npx expo start`.
