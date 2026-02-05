# Simulator Location Sorunu Çözümü

Simulator'de location Miami yerine Los Angeles gösteriyorsa, simulator'ün location ayarlarını değiştirmeniz gerekir.

## Çözüm 1: Simulator'de Location Ayarlama

### Adımlar:

1. **Simulator'ü açın**

2. **Menüden:**
   - **Features > Location > Custom Location...**

3. **Miami koordinatlarını girin:**
   - **Latitude:** `25.7617`
   - **Longitude:** `-80.1918`
   - **Apply** butonuna tıklayın

### Alternatif: Preset Location

1. **Features > Location > Miami, FL**

## Çözüm 2: Xcode'da Location Simulate Etme

Xcode'da:
1. Simulator'ü seçin
2. **Debug > Location > Custom Location...**
3. Miami koordinatlarını girin:
   - Latitude: `25.7617`
   - Longitude: `-80.1918`

## Çözüm 3: Terminal'den Location Ayarlama

```bash
# Miami koordinatlarını simulator'e gönder
xcrun simctl location booted set 25.7617 -80.1918
```

## Miami Koordinatları

- **Latitude:** 25.7617
- **Longitude:** -80.1918

## Test Etme

Location'ı ayarladıktan sonra:
1. Uygulamada time clock'u açın
2. Clock In yapın
3. Location'ın Miami olarak göründüğünü kontrol edin

## Notlar

- Simulator'de location varsayılan olarak Apple'ın Cupertino, CA konumunu kullanır
- Her simulator session'ında location'ı tekrar ayarlamanız gerekebilir
- Gerçek cihazda GPS otomatik olarak doğru konumu alır

## Sorun Devam Ederse

1. Simulator'ü kapatıp yeniden açın
2. Location permission'ı kontrol edin
3. Uygulamayı yeniden başlatın
