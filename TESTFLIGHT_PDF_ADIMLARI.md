# TestFlight / Production build öncesi – PDF (mobil) için

Mobilde Invoice ve Proposal PDF’i çalışsın diye aşağıdakileri **proje klasöründe** terminalde sırayla yapın.

## 1. Paketleri kur (Expo uyumlu sürüm)

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx expo install expo-print expo-sharing
```

Bu komut `expo-print` ve `expo-sharing`’i Expo SDK’nıza uygun sürümle kurar ve gerekirse `package.json`’ı günceller.

## 2. Production / TestFlight build

```bash
eas build --platform ios --profile production
```

Veya önce `eas.json`’daki profile göre (örn. `preview` / `production`) build alıp, sonra TestFlight’a submit edebilirsiniz.

---

**Not:** Kod tarafında PDF (mobil) tekrar açıldı. Sadece bu iki paketi kurup build almanız yeterli.
