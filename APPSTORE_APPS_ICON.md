# App Store Connect – "Apps" listesinde ikon görünsün

TestFlight’ta logo görünüyor ama **Apps** sayfasındaki uygulama kartında hâlâ placeholder varsa aşağıdakileri yapın.

## 1. Sürüm için doğru build’i seçin

- App Store Connect → **Blue Crew** (uygulamanıza tıklayın)
- Sol menüden **TestFlight** veya **App Store** (iOS uygulaması) → **1.0.0** sürümüne girin
- **Build** alanında mutlaka **1.0.0 (37)** (logolu build) seçili olsun  
  Eski build (34) seçiliyse, açılır listeden **37**’yi seçip kaydedin.

Bazen “Apps” listesindeki küçük ikon, o sürüm için seçili build’den alınır; 37 seçili olunca listeye de yansıyabilir.

## 2. App Store sekmesinde ikon (store listing)

- Aynı uygulama içinde **App Store** (veya **App Information** / sürüm detayı) bölümüne girin
- **App Icon** veya **1024 x 1024 px icon** istenen bir alan varsa, projenizdeki **alpha’sız** 1024x1024 PNG ikonunuzu buraya da yükleyin  
  (Bazı hesaplarda bu alan, mağaza sayfası için kullanılır; bazen “Apps” önizlemesi de buradan beslenir.)

## 3. Önbellek / gecikme

- Değişiklikten sonra sayfayı yenileyin veya bir süre (birkaç saat) bekleyin; bazen “Apps” listesi gecikmeli güncellenir.
- Build 37’yi **Submit for Review** ile gönderdiğinizde de listeyi tetikleyebilir.

## Özet

1. Sürüm 1.0.0 için **Build: 1.0.0 (37)** seçili olsun.  
2. Varsa **App Icon (1024x1024)** alanına aynı logoyu yükleyin.  
3. Gerekirse sayfayı yenileyin / bir süre bekleyin veya sürümü incelemeye gönderin.

Bu adımlardan sonra “Apps” kısmında da logo görünmüyorsa, tam ekran görüntüsü (Apps sayfası + hangi uygulama) ile yazarsanız, menü yapısına göre adım adım tarif edebilirim.
