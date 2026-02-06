# EAS iOS Build / Archive Hatası – Yapılan Düzeltmeler

## Sorun
- **PhaseScriptExecution [Expo] Configure project** script’i Archive sırasında başarısız oluyordu.
- **Hermes** ile ilgili uyarı: script phase output tanımlı olmadığı için her build’de çalışacak deniyordu (bu sadece uyarı, build’i düşüren asıl hata değildi).

## Yapılan Değişiklikler

### 1. `[Expo] Configure project` script’i (Xcode)
**Dosya:** `ios/BlueCrew.xcodeproj/project.pbxproj`

- Script başında **`.xcode.env`** ve **`.xcode.env.local`** source ediliyor; böylece EAS/CI’da `NODE_BINARY` kullanılabiliyor.
- **Node** bulunamazsa EAS’taki olası nvm yolu da deneniyor: `/Users/expo/.nvm/versions/node/*/bin/node`.
- **Çıktı klasörü** yoksa oluşturuluyor: `mkdir -p "…/Pods/Target Support Files/Pods-BlueCrew"`.
- Node bulunamazsa net hata mesajı verilip çıkılıyor: `error: node not found for [Expo] Configure project`.

### 2. EAS post-install (`scripts/eas-expo-configure.sh`)
- EAS build’de Xcode script’lerinin node’u bulması için **`ios/.xcode.env.local`** yazılıyor; içinde `NODE_BINARY` set ediliyor.
- Post-install, `pod install`’dan önce çalıştığı için Pods klasörü yoksa ExpoModulesProvider üretimi atlanıyor; dosyayı Xcode script’i zaten oluşturuyor. Önceki davranış korunuyor, sadece `.xcode.env.local` eklendi.

## Hermes uyarısı
- Mesaj: *"Run script build phase '[CP-User] [Hermes] Replace Hermes...' will be run during every build because it does not specify any outputs."*
- Bu **uyarı**; archive’ı düşüren asıl neden değil. İsterseniz Xcode’da ilgili script phase’e gidip **"Based on dependency analysis"** kapatılabilir (her build’de çalışsın denerek uyarı giderilir). Pods her `pod install`’da yenilendiği için projede kalıcı patch yapılmadı.

## Sonraki adım
1. Değişiklikleri commit edin.
2. EAS’ta tekrar deneyin:  
   `eas build --platform ios --profile production`  
   (veya kullandığınız profile).

Hâlâ aynı script’ten hata alırsanız, EAS build log’unda **PhaseScriptExecution [Expo] Configure project** adımının tam çıktısına bakın; orada `node not found` veya başka bir hata satırı görünecektir.
