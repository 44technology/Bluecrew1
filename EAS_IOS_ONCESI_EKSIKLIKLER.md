# EAS ile iOS Build Öncesi Eksiklikler ve Yapılan Düzeltmeler

Bu doküman, EAS (Expo Application Services) ile iOS build almadan önce giderilen ve kalan eksiklikleri özetler.

## Yapılan düzeltmeler

### 1. npm script
- **`package.json`**: `"start": "expo start"` eklendi. Böylece `npm start` ile Metro/Expo başlatılabiliyor (önceden "Missing script: start" hatası alınıyordu).

### 2. expo-haptics kullanımı
- **Sorun**: Dinamik import ile `const { Haptics } = await import('expo-haptics')` kullanılıyordu; `expo-haptics` modülü `Haptics` named export vermiyor.
- **Düzeltme**: Tüm ilgili dosyalarda `const Haptics = (await import('expo-haptics')).default` olacak şekilde güncellendi.
- **Dosyalar**: `change-order.tsx`, `clients.tsx`, `expenses.tsx`, `invoices.tsx`, `leads.tsx`, `material-request.tsx`, `proposals.tsx`, `reports.tsx`, `team.tsx`, `tracking.tsx`.

### 3. StyleSheet tekrarlayan anahtarlar (duplicate keys)
- **expenses.tsx**: `paymentCountText` içinde tekrarlanan `fontSize`, `color`, `marginTop` kaldırıldı.
- **invoices.tsx**: İkinci tanımlar kaldırıldı: `addButton`, `addButtonText`, `content`, `helperText`, `emptyState`, `emptyText`, `selectedIndicator`.
- **hr.tsx**: İkinci `backButton` / `backButtonText` bloğu kaldırıldı (web-specific stiller için ilk tanım kullanılıyor).

### 4. Gereksiz dosya
- **app/(tabs)/material-request.tsx.bak** silindi.

### 5. EAS / iOS için kontrol edilenler
- **app.json**: `ios.bundleIdentifier`, `ios.googleServicesFile`, `extra.eas.projectId` tanımlı.
- **eas.json**: `development`, `preview`, `production` profilleri mevcut; production’da `autoIncrement: true`.
- **GoogleService-Info.plist**: Proje kökü ve `ios/BlueCrew/` altında mevcut.
- **google-services.json**: Proje kökünde mevcut.
- **firestore.indexes.json**: Proposals, documents, notifications, time_clock, comments, todos index’leri tanımlı.

---

## Kalan TypeScript uyarıları / hatalar

Expo/EAS build, genelde bu tip hataları engellemeden derlenebilir; ancak ileride `tsc --noEmit` ile tam temiz çıktı almak için aşağıdakiler giderilebilir.

### Kategori 1: Eksik StyleSheet anahtarları
Bazı sayfalarda `styles.xxx` kullanılıyor ama `StyleSheet.create({ ... })` içinde tanımlı değil. Eksik stiller eklenmeli veya kullanım mevcut bir stile yönlendirilmeli.

- **change-order.tsx**: `helperText`, `deadlinePreview`, `deadlinePreviewText`
- **clients.tsx**: `eyeButton`
- **clients/[id].tsx**: `invoiceTabsContainer`, `invoiceStatusTabs`, `invoiceStatusTab`, `invoiceStatusTabActive`, `invoiceStatusTabText`, `invoiceStatusTabTextActive`, `invoiceList`, `invoiceCard`, `invoiceCardHeader`, … (invoice ile ilgili birçok stil)
- **invoices.tsx**: `documentItem`
- **leads.tsx**: `dateInput`, `dateInputText`, `dateInputPlaceholder`, `readOnlyValue`, `labelRow`, `generateButton`, `generateButtonText`, `copyButton`, `copyButtonText`, `helperText`
- **material-request.tsx**: `under_reviewBadge`, `under_reviewText`
- **payroll.tsx**: `editButton`; ayrıca `Edit` (lucide) import eksik
- **project-approval.tsx**: `cardMetaRow` (öneri: `cardMeta` kullanılabilir)
- **project/[id].tsx**: `workTitlesList`, `workTitleItem`, `workTitleInfo`, `workTitleName`, `workTitleDescription`, `workTitleDetails`, `workTitleDetailText`, `workTitlePrice`, `removeWorkTitleButton`, `addWorkTitleForm`, `quantityUnitRow`, `quantityInputContainer`, `addWorkTitleButton`, `calculatedPriceContainer`, `calculatedPriceLabel`, `calculatedPriceValue`, `totalBudgetInput`, `clientOptionContent`, `emptyState`, `emptyText`
- **proposals.tsx**: `inputText`, `placeholderText`

### Kategori 2: Tip uyumsuzlukları
- **Invoice status**: Bazı yerlerde `"approved"` kullanılıyor; `Invoice` tipinde sadece `pending` | `paid` | `overdue` | `partial-paid` | `cancelled` var. Tip genişletilmeli veya karşılaştırma kodu güncellenmeli (clients.tsx, clients/[id].tsx).
- **User role**: `"office"` karşılaştırmaları var; `User.role` tipinde `'office'` yok (employee.tsx, payroll.tsx, project/[id].tsx, documents.tsx vb.). Ya tipe `'office'` eklenmeli ya da karşılaştırmalar kaldırılmalı.
- **Project status**: `project-approval` ve benzeri yerlerde `"rejected"` / `"approved"` kullanılıyor; `Project` tipinde `status` farklı olabilir. types/index.ts içinde `Project` ve ilgili tipler gözden geçirilmeli.
- **project/[id].tsx**: `setProject(prev => ({ ...prev, ... }))` kullanımlarında dönüş tipi `Project | null` ile uyumlu olmalı (ör. `id` zorunlu alan).
- **project-approval.tsx**: `updateProject(..., { status: 'rejected' })` – `Project.status` tipine `rejected` eklenmeli veya ayrı bir alan kullanılmalı; `change_request_at` → `Proposal` tipinde yok, `change_request_by` var.
- **proposals.tsx**: `sent_for_approval_at` – `Proposal` tipinde yok.
- **material-request.tsx**: State’te `null` atanan alanlar `string | undefined` bekliyor; `undefined` kullanılabilir.
- **commission.tsx**: `CommissionEntry` ve proposal/invoice tipleri uyumlu hale getirilmeli.
- **payroll.tsx**: `reason` parametresi için tip verilmeli; `Edit` ikonu import edilmeli.
- **project/[id]/schedule.tsx**, **project/[id]/materials.tsx**: `PMSchedule` / `MaterialRequest` ile uyumlu alanlar kullanılmalı.

### Kategori 3: StyleSheet / stil tipi
- **employee.tsx**, **project/[id].tsx**, **projects.tsx**, **sales.tsx**: `style={[styles.x, styles.y]}` gibi array atamalarında React Native tipi `ViewStyle[]` bekliyor; `StyleSheet.flatten` veya tek bir stil objesi kullanılabilir.

### Kategori 4: Diğer
- **project/[id].tsx**, **invoices.tsx**, **expenses.tsx**, **projects.tsx**, **proposals.tsx** vb.: `StyleSheet.create` içinde hâlâ aynı isimle birden fazla anahtar varsa (duplicate key) kaldırılmalı.
- **sales-report.tsx**: `View` bileşenine `TextStyle` (fontSize, color, textAlign) verilmiş; bu stil bir `Text` bileşenine verilmeli veya stil ayrıştırılmalı.
- **proposals.tsx**: `width: 'calc(50% - 8px)'` React Native’de geçerli değil; sayı veya yüzde string kullanılabilir.

---

## EAS iOS build öncesi önerilen adımlar

1. **Expo hesabı**: `npx eas-cli login` ile giriş yapın.
2. **Firebase index’leri**: Firestore composite index’lerinin Firebase Console’da “Enabled” olduğundan emin olun. Gerekirse `firebase deploy --only firestore:indexes`.
3. **İlk build**:  
   `npx eas-cli build --platform ios --profile production`  
   İsterseniz TestFlight’a otomatik gönderim için:  
   `npx eas-cli build --platform ios --profile production --auto-submit`
4. **Apple**: App Store Connect’te uygulama (bundle ID: `com.bluecrew.app`) oluşturulmuş olmalı; ilk submit’te EAS Apple kimlik bilgilerini isteyecektir.

Detaylı komutlar için: **PRODUCTION_BUILD.md**.
