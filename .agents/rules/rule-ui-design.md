---
trigger: model_decision
description: # UI Tasarım Kuralları
---

## Temel İlkeler

- **Yalnızca açık tema** — dark mode yok, medya sorgusu ekleme
- **Yumuşak ve yuvarlak** — her yerde büyük border-radius, keskin kenar yok
- **8px grid** — tüm spacing'ler `spacing` token'larından

## Token Kullanımı — İhlal Edilemez

```typescript
// ✓ Token kullan
backgroundColor: colors.surface
padding: spacing.base          // 16px
borderRadius: radius.lg        // 16px

// ✗ Hardcode yazma
backgroundColor: '#FFFFFF'
padding: 16
borderRadius: 16
```

## Renk Rehberi (colors.ts)

| Kullanım | Token |
|---|---|
| Sayfa arka planı | `colors.background` (#FAFAFA) |
| Kart/modal | `colors.surface` (#FFFFFF) |
| Birincil buton | `colors.primary` (#4FC3F7) |
| Başarı / hedef altı | `colors.secondary` (#81C784) |
| Uyarı / hedefe yakın | `colors.accent` (#FFB74D) |
| Hata / hedef aşıldı | `colors.error` (#EF5350) |
| Favori / streak | `colors.pink` (#F48FB1) |
| Ana metin | `colors.textPrimary` (#212121) |
| İkincil metin | `colors.textSecondary` (#757575) |
| Kenarlık | `colors.border` (#E0E0E0) |

## Tipografi (typography.ts)

| Rol | Boyut | Ağırlık |
|---|---|---|
| Hero sayı (kalori halkası) | `typography.hero` (36) | ExtraBold |
| Ekran başlığı | `typography.xxl` (24) | Bold |
| Bölüm başlığı | `typography.lg` (18) | SemiBold |
| Kart başlığı | `typography.md` (16) | SemiBold |
| Gövde metni | `typography.base` (14) | Regular |
| Açıklama / etiket | `typography.sm` (12) | Medium |

Font her zaman Nunito: `fontFamily: typography.fontBold` vb.

## İkonlar

Yalnızca `phosphor-react-native`. Başka ikon kütüphanesi ekleme.

```typescript
import { Heart, Plus, BookOpen } from 'phosphor-react-native'
<Heart size={24} color={colors.pink} weight="fill" />
```

Tab ikonları: `BookOpen` (Tarifler), `CalendarCheck` (Günlük), `Compass` (Keşfet), `Lightning` (Aktivite), `UserCircle` (Profil)

## Animasyonlar

Yalnızca `react-native-reanimated`. `Animated` API kullanma.

```typescript
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'

// Buton basma efekti
const scale = useSharedValue(1)
const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
// onPressIn: scale.value = withSpring(0.97)
// onPressOut: scale.value = withSpring(1.0)
```

- UI geri bildirimleri: max 600ms
- Kutlama animasyonları: max 1500ms
- Spring animasyonları: etkileşimli elementler için
- Timing animasyonları: veri güdümlü dolumlar için (kalori halkası)

## Buton Varyantları

```
Birincil:  arka plan primary, beyaz metin, pill şekli, shadow.sm
İkincil:   beyaz arka plan, primary kenarlık, primary metin
Ghost:     şeffaf, textSecondary metin, kenarlık yok
```

## Boş Durum

Liste boşsa her zaman `<EmptyState>` bileşenini kullan — düz metin gösterme.
Avatar + açıklayıcı mesaj + opsiyonel CTA butonu içermeli.