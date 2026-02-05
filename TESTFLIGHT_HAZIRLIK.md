# TestFlight'a Göndermeye Hazırlık

## Kısa cevap

**Evet – önce production build almanız gerekir.** TestFlight’a sadece **production** profili ile alınan iOS build’i yüklenir (development/preview değil).

---

## Hızlı adımlar

### 1. Önkoşullar (bir kez)

- [ ] Apple Developer hesabı aktif ($99/yıl)
- [ ] [App Store Connect](https://appstoreconnect.apple.com)’de uygulama oluşturuldu (Bundle ID: `com.bluecrew.app`)
- [ ] EAS CLI: `npm install -g eas-cli` → `eas login`
- [ ] Proje kökünde `GoogleService-Info.plist` var

### 2. Production build + TestFlight’a gönderim

Proje klasöründe:

```bash
# Build + otomatik TestFlight’a yükleme (tek komut)
eas build --platform ios --profile production --auto-submit
```

İlk kez çalıştırıyorsanız EAS, Apple kimlik bilgilerini (Apple ID + app-specific password veya App Store Connect API Key) isteyebilir.

### 3. Alternatif: Önce build, sonra submit

```bash
# Sadece build
eas build --platform ios --profile production

# Build bittikten sonra (eas build:list ile kontrol edin)
eas submit --platform ios --latest
```

### 4. Durum kontrolü

```bash
eas build:list
```

---

## Production build neden gerekli?

| Profil        | Kullanım              | TestFlight |
|---------------|------------------------|------------|
| development   | Geliştirme, dev client | Hayır      |
| preview       | Dahili dağıtım        | Hayır      |
| **production**| App Store / TestFlight | **Evet**   |

`eas.json` içinde production profili tanımlı ve `autoIncrement: true` ile her build’de build numarası otomatik artıyor.

---

## Özet

1. **Production build alın:** `eas build --platform ios --profile production`
2. **İsterseniz tek komutla gönderin:** `--auto-submit` ekleyin
3. Build tamamlanınca (yaklaşık 15–30 dk) EAS .ipa’yı App Store Connect’e yükler
4. App Store Connect → TestFlight’ta build işlendikten sonra testçi ekleyip davet gönderin

Detaylı adımlar için: **TESTFLIGHT_BASLANGIC.md** ve **TESTFLIGHT_DEPLOY.md**
