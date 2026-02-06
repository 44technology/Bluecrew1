# Son Değişiklikleri Git'e Atma

## 1. Tüm değişiklikleri stage'e al
```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
git add -A
```
veya sadece belirli dosyalar:
```bash
git add app/(tabs)/permissions.tsx app/(tabs)/reports.tsx app/(tabs)/settings.tsx app/(tabs)/invoices.tsx app/(tabs)/proposals.tsx package.json
```

## 2. Commit (yerel kayıt)
```bash
git commit -m "UI: buton kontrast düzeltmeleri, PDF mobil, avatar, Reports/Permissions"
```

## 3. Uzak repoya gönder (push)
```bash
git push origin master
```
(Eğer branch adınız `main` ise: `git push origin main`)

---

## Simülatörde değişiklikleri görmek için

- **iOS Simulator:** Uygulamayı kapatıp tekrar açın veya `Cmd + R` ile yenileyin.
- **Expo:** Terminalde `npx expo start` çalışıyorsa, simülatörde uygulamayı sallayıp "Reload" veya `r` tuşu ile yenileyin.
- **Native build:** Kod değişince otomatik yenilenmeyebilir; `npx expo run:ios` ile yeniden build edin.
