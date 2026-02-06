# EAS Build Öncesi: Commit ve Push

EAS Build **bulutta** çalışır ve projeyi **Git deposundan** (GitHub / GitLab / origin) alır. Yerelde yaptığın değişiklikler **commit + push** edilmeden EAS’a **yansımaz**.

## Her EAS build öncesi

1. **Değişiklikleri commit et**
   ```bash
   git add .
   git status   # ne eklendiğine bak
   git commit -m "açıklayıcı mesaj"
   ```

2. **Remote’a gönder**
   ```bash
   git push origin master
   ```
   (Dal adın farklıysa `main` veya kullandığın dalı yaz.)

3. **Sonra EAS build al**
   ```bash
   npx eas-cli build --platform ios --profile production
   ```

## Bu sefer yapılan commit

- `app.json`: New Architecture kapatıldı (`newArchEnabled: false`)
- `ios/Podfile`: Install pods aşamasında node’a ihtiyaç kalmadan expo/react-native yolu bulunuyor
- `ios/Podfile.properties.json`: `newArchEnabled: "false"`
- `ios/.xcode.env`: Node fallback yolları

Bu commit **yerelde yapıldı**. Build’in EAS’ta yeşil olması için **mutlaka push et**:

```bash
git push origin master
```

Push’tan sonra aynı EAS komutunu tekrar çalıştır.
