# "No development build" Neden Oluyor?

## Kısa cevap

Projede **expo-dev-client** var. Bu demek ki:

- **Expo Go** ile bu projeyi açamazsınız.
- Cihazda/simülatörde **bu projeye özel bir uygulama** (development build) kurulu olmalı.
- Bu uygulama hiç **kurulmadı** çünkü `npx expo run:ios` daha önce **pod install** hatası yüzünden **tamamlanamadı**.

Yani: Development build bir kez kurulmadan `expo start` ile iOS’ta açamazsınız; hep aynı hata çıkar.

---

## Ne yapmak gerekiyor? (Tek yol)

Development build’i **bir kez** simülatöre/cihaza kurmanız lazım. Bunun tek yolu:

1. **CocoaPods’un çalışması** (şu an `pod install` “spawn pod ENOENT” veriyordu).
2. **`npx expo run:ios`** komutunun **baştan sona hatasız** bitmesi.

Bu ikisi tamamlanınca simülatörde **Blue Crew** (com.bluecrew.app) uygulaması kurulur. O andan sonra `npx expo start` değil, sadece **expo start** yeterli; uygulama Metro’ya bağlanır ve “No development build” hatası **kaybolur**.

---

## Adım adım (kesin çözüm)

### 1) CocoaPods’u Expo’nun bulacağı şekilde kurun

**Seçenek A – Homebrew (en sağlam):**

```bash
brew install cocoapods
```

**Seçenek B – Gem kullandıysanız, aynı terminalde PATH verin:**

```bash
export PATH="$(gem environment 2>/dev/null | grep 'EXECUTABLE DIRECTORY' | sed 's/.*EXECUTABLE DIRECTORY: *//' | xargs):$PATH"
```

`which pod` ile `pod`’un bulunduğundan emin olun.

### 2) Development build’i kurun (bir kez)

**Aynı terminalde**, proje klasöründe:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx expo run:ios
```

Bu komut:

- Gerekirse `pod install` çalıştırır
- iOS uygulamasını derler
- Simülatörde **Blue Crew (com.bluecrew.app)** uygulamasını kurar

Bu adım **ilk seferde** 5–15 dakika sürebilir. Hata vermeden bitmeli.

### 3) Bundan sonra her gün

Development build bir kez kurulduktan sonra:

```bash
npx expo start
```

yeterli. Simülatörde/cihazda **Blue Crew** uygulamasını açın; Metro’ya bağlanır, “No development build” hatası **bir daha çıkmaz**.

---

## Özet

| Durum | Sonuç |
|-------|--------|
| Development build hiç kurulmadı | `expo start` → “No development build” hatası |
| `npx expo run:ios` bir kez **başarıyla** bitti | Simülatörde Blue Crew kuruldu → `expo start` çalışır |
| Sadece web’de çalıştırmak istiyorum | `npx expo start --web` kullanın (build gerekmez) |

**Özet:** Hata, development build’in hiç yüklenmemiş olmasından kaynaklanıyor. CocoaPods’u düzelttikten sonra **bir kez** `npx expo run:ios` çalıştırıp build’i kurun; sonrasında hep aynı hata almanız gerekmez.
