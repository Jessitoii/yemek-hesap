---
trigger: model_decision
description: Yeni Ekran Ekle
---

## Görev

Belirtilen ekranı `docs/03-screens.md`'deki spec'e uygun şekilde oluştur.

## Adımlar

### 1. Spec'i Oku

`docs/03-screens.md`'den ekranı bul. Şunlara dikkat et:
- Header içeriği (başlık, ikonlar, geri butonu)
- Body bölümleri
- Alt bar (varsa)
- Boş state

### 2. Route Path'ini Belirle

`docs/05-folder-structure.md`'den doğru `app/` path'ini bul.

### 3. Gerekli Bileşenleri Listele

Ekranın hangi bileşenlere ihtiyacı var?
- `components/ui/` içinde var mı?
- `components/[domain]/` içinde var mı?
- Yoksa önce bileşeni oluştur, sonra ekranı

### 4. Ekranı Yaz

Yapı:
```tsx
import { View, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { colors } from '@/constants/colors'
import { spacing } from '@/constants/theme'

export default function EkranAdi() {
  return (
    <>
      <Stack.Screen options={{ title: 'Başlık', headerShown: true }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: spacing.base }}>
          {/* spec'teki bölümler */}
        </View>
      </ScrollView>
    </>
  )
}
```

### 5. Kurallar

- Renk → `colors.ts` token'ı
- Spacing → `spacing.xs/sm/md/base/lg/xl`
- Font → `Nunito` (`typography.ts`)
- İkon → `phosphor-react-native`
- Animasyon → `react-native-reanimated`
- Boş state → `<EmptyState>` bileşeni

### 6. Navigasyon Bağlantısını Kontrol Et

Bu ekrana nereden gelinir? İlgili ekranı/bileşeni güncelle.

### 7. PROJECT.md Güncelle