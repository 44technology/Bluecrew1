# Geri Tuş Butonu Güncelleme Rehberi

Tüm sayfalardaki geri tuş butonları modern tasarımla güncelleniyor.

## Yapılan Değişiklikler

✅ **BackButton Component Oluşturuldu:**
- `components/BackButton.tsx` - Modern, yeniden kullanılabilir geri tuş butonu
- Project details sayfasındaki tasarım kullanılıyor
- Özelleştirilebilir renk ve arka plan desteği

✅ **Güncellenen Sayfalar:**
- `project/[id]/schedule.tsx` ✅
- `project/[id]/documents.tsx` ✅
- `change-order.tsx` ✅
- `time-clock.tsx` ✅
- `team.tsx` ✅
- `sales-report.tsx` ✅
- `project/[id]/materials.tsx` ✅
- `project/[id]/daily-logs.tsx` ✅

## Kalan Sayfalar

Aşağıdaki sayfalarda da geri tuş butonları güncellenecek:
- `invoices.tsx`
- `settings.tsx`
- `tracking.tsx`
- `proposals.tsx`
- `project-approval.tsx`
- `material-request.tsx`
- `clients.tsx`
- `schedule.tsx`
- `payroll.tsx`
- `sales.tsx`
- `employee.tsx`
- `commission.tsx`
- `leads.tsx`
- `clients/[id].tsx`
- `project/[id].tsx` (loading/error durumları)

## BackButton Kullanımı

```tsx
import BackButton from '@/components/BackButton';

// Basit kullanım (varsayılan renkler)
<BackButton />

// Özelleştirilmiş renkler
<BackButton 
  color="#ffcc00" 
  backgroundColor="rgba(255, 255, 255, 0.2)"
/>

// Özel onPress handler
<BackButton 
  onPress={() => router.push('/custom-path')}
  color="#236ecf"
/>
```

## Tasarım Özellikleri

- **Boyut:** 40x40 piksel
- **Şekil:** Yuvarlak (borderRadius: 20)
- **Arka Plan:** Yarı saydam beyaz (rgba(255, 255, 255, 0.2))
- **Kenarlık:** İnce beyaz kenarlık
- **Gölge:** Hafif gölge efekti
- **Icon:** ArrowLeft (lucide-react-native)

## Test Etme

Simulator'de:
1. Her sayfaya gidin
2. Sol üstteki geri tuş butonunun modern tasarımla göründüğünü kontrol edin
3. Butona tıklayarak geri gitme işlevinin çalıştığını kontrol edin
