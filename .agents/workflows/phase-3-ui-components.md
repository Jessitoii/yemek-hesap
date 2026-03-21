---
description: # Faz 3 — Temel UI Bileşenleri  **Ön koşul:** Faz 0 tamamlandı (constants + types)  **Amaç:** Tüm ekranların kullandığı yeniden kullanılabilir bileşen kütüphanesi. Bu faz bitmeden hiçbir ekran yazılamaz.
---

## Checkpoint 3.1 — Temel Bileşenler (`components/ui/`)

- [ ] `Button.tsx`
  - Varyantlar: `primary` | `secondary` | `ghost`
  - Prop'lar: `label`, `onPress`, `disabled`, `loading`, `fullWidth`
  - Basma animasyonu: scale 0.97 + hafif kararma (reanimated)
  - Disabled: `colors.textDisabled`, tıklanamaz

- [ ] `Input.tsx`
  - Prop'lar: `label`, `error`, `value`, `onChangeText`, `keyboardType`, `placeholder`
  - Odak durumu: `colors.primary` kenarlık
  - Hata durumu: `colors.error` kenarlık + altında hata mesajı
  - Font: Nunito Regular, `typography.base`

- [ ] `Card.tsx`
  - Prop'lar: `children`, `style`, `onPress?`
  - `colors.surface` arka plan, `radius.lg`, `shadow.sm`
  - `onPress` varsa Pressable sarmalayıcı + basma animasyonu

- [ ] `Modal.tsx`
  - Alt sayfa modal (bottom sheet)
  - Prop'lar: `visible`, `onClose`, `title`, `children`
  - Arka plan karartması, yukarı sürükleyerek kapatma

- [ ] `Badge.tsx`
  - Küçük renkli etiket
  - Prop'lar: `label`, `color` (primary/secondary/accent/error)

- [ ] `Chip.tsx`
  - Seçilebilir filtre chip'i
  - Prop'lar: `label`, `selected`, `onPress`
  - Seçili: `colors.primaryLight` dolgu + `colors.primary` metin

- [ ] `Divider.tsx` — yatay çizgi, `colors.borderLight`

- [ ] `EmptyState.tsx`
  - Prop'lar: `message`, `ctaLabel?`, `onCta?`
  - Avatar (idle animasyon) + açıklayıcı metin + opsiyonel CTA butonu

- [ ] `LoadingSpinner.tsx` — merkezlenmiş `ActivityIndicator`, `colors.primary`

- [ ] `ProgressBar.tsx`
  - Prop'lar: `value` (0-1), `color`, `label?`
  - Değer değiştiğinde genişlik animasyonu (reanimated)

- [ ] `ProgressRing.tsx`
  - Prop'lar: `value` (0-1+), `size`, `strokeWidth`, `color`, `centerLabel`
  - SVG tabanlı dairesel ilerleme
  - Renk: yeşil → turuncu → kırmızı (%90 / %100 eşiklerinde)
  - Yükleme sırasında 0'dan hedefe animasyon

- [ ] `Avatar.tsx`
  - Prop'lar: `state`: `idle` | `celebrate` | `sad` | `thinking` | `wave` | `point`
  - Lottie JSON dosyalarını yükler (`assets/animations/`)
  - State değiştiğinde animasyonu geçiş yaptır

- [ ] `Toast.tsx`
  - Geçici bildirim mesajı (3 saniye)
  - Prop'lar: `message`, `type`: `success` | `error` | `info`
  - Yukarıdan kayarak giriş/çıkış animasyonu

**✓ Checkpoint 3.1 geçti:** Her bileşen geliştirici önizlemesinde görsel olarak doğrulandı.

---

## Checkpoint 3.2 — Tab Bar

- [ ] `app/(tabs)/_layout.tsx`
  - 5 tab: Tarifler, Günlük, Keşfet, Aktivite, Profil
  - Her tab için renk: primary, secondary, accent, pink, bordo
  - Her tab için Phosphor ikon
  - Aktif: renkli ikon + renkli etiket + küçük nokta göstergesi
  - Pasif: `colors.textDisabled` ikon + etiket

**✓ Checkpoint 3.2 geçti:** Tab bar görünüyor, tüm tab'lar arasında geçiş yapılıyor.

---

## Faz 3 Tamamlandı

**Kontrol et:**
- [ ] Tüm bileşenler render ediliyor, hata yok
- [ ] `Button` basma animasyonu çalışıyor
- [ ] `ProgressRing` değer değiştiğinde animasyon yapıyor
- [ ] `EmptyState` avatar animasyonu çalışıyor
- [ ] Tab bar doğru renkler + ikonlarla gösteriyor

**Sonraki faz:** Faz 4 — Günlük Takip (en kritik özellik)
