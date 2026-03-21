# Birim Dönüşüm Referansı

Bu dosyayı `calorie-cost-calc` skill'i kullanırken oku.

---

## densityTable.ts Yapısı

`utils/densityTable.ts` dosyası 150+ malzeme için birim → gram eşdeğerlerini içerir.

```typescript
export interface DensityEntry {
  teaspoon?:      number   // çay kaşığı (gram)
  tablespoon?:    number   // yemek kaşığı (gram)
  cup?:           number   // bardak (gram)
  piece?:         number   // adet (gram)
  slice?:         number   // dilim (gram)
  handful?:       number   // avuç (gram)
  gram_per_piece?: number  // 'adet' için alternatif alan adı
}

export const densityTable: Record<string, DensityEntry> = {
  // SIVI/YARI SIVI
  'su':              { teaspoon: 5,   tablespoon: 15,  cup: 240 },
  'süt':             { teaspoon: 5,   tablespoon: 15,  cup: 240 },
  'yoğurt':          { teaspoon: 6,   tablespoon: 18,  cup: 245 },
  'zeytinyağı':      { teaspoon: 4.5, tablespoon: 13.5, cup: 216 },
  'tereyağı':        { teaspoon: 5,   tablespoon: 14,  cup: 227 },
  'bal':             { teaspoon: 7,   tablespoon: 21,  cup: 340 },

  // UN/TAHIL
  'un':              { teaspoon: 3,   tablespoon: 8,   cup: 125 },
  'pirinç':          { teaspoon: 4,   tablespoon: 12,  cup: 185 },
  'bulgur':          { teaspoon: 4,   tablespoon: 11,  cup: 180 },
  'yulaf':           { teaspoon: 2,   tablespoon: 6,   cup: 90  },
  'şeker':           { teaspoon: 4,   tablespoon: 12,  cup: 200 },
  'tuz':             { teaspoon: 6,   tablespoon: 18 },
  'kabartma tozu':   { teaspoon: 4,   tablespoon: 12 },

  // SEBZE
  'soğan':           { piece: 110, handful: 50 },
  'sarımsak':        { piece: 5 },
  'domates':         { piece: 150 },
  'biber':           { piece: 80 },
  'patates':         { piece: 150 },
  'havuç':           { piece: 80 },
  'salatalık':       { piece: 200, slice: 20 },
  'patlıcan':        { piece: 300 },
  'kabak':           { piece: 250 },
  'ıspanak':         { handful: 30, cup: 30 },
  'maydanoz':        { handful: 15, tablespoon: 4 },
  'nane':            { handful: 10, tablespoon: 3 },

  // MEYVE
  'elma':            { piece: 180 },
  'muz':             { piece: 120 },
  'limon':           { piece: 100 },
  'portakal':        { piece: 200 },
  'çilek':           { piece: 12, cup: 150, handful: 70 },

  // ET/PROTEİN
  'yumurta':         { piece: 60 },
  'tavuk göğsü':     { piece: 180 },

  // KURUBAKLAGIL/FISTIK
  'mercimek':        { tablespoon: 10, cup: 200 },
  'nohut':           { tablespoon: 10, cup: 200 },
  'ceviz':           { piece: 7, handful: 30, cup: 100 },
  'badem':           { piece: 1.2, handful: 25, cup: 145 },

  // SÜSLEME/BAHARAT
  'karabiber':       { teaspoon: 2.3 },
  'kimyon':          { teaspoon: 2.5 },
  'pul biber':       { teaspoon: 2.5 },
  'zerdeçal':        { teaspoon: 3 },
}
```

---

## Unit Converter Kullanımı

```typescript
import { toGrams } from '@/utils/unitConverter'

// Başarılı dönüşüm
toGrams(2, 'bardak', 'un')     // → 250
toGrams(3, 'yemek kaşığı', 'zeytinyağı')  // → 40.5
toGrams(1, 'adet', 'yumurta')  // → 60

// null döner → kullanıcıdan gram gir
toGrams(1, 'adet', 'bilinmeyen malzeme')  // → null
```

`null` döndüğünde: kullanıcıya `"[malzeme] için kaç gram?" `diye sor, cevabı cache'le.

---

## Egzersiz Kalori Hesabı (MET Değerleri)

`constants/exercises.ts`:

```typescript
export const EXERCISES: Record<string, { met: number; label: string }> = {
  running:  { met: 9.8,  label: 'Koşu' },
  cycling:  { met: 7.5,  label: 'Bisiklet' },
  fitness:  { met: 5.0,  label: 'Fitness' },
  walking:  { met: 3.5,  label: 'Yürüyüş' },
  swimming: { met: 7.0,  label: 'Yüzme' },
  football: { met: 7.0,  label: 'Futbol' },
  yoga:     { met: 2.5,  label: 'Yoga' },
  other:    { met: 4.0,  label: 'Diğer' },
}

// Formül: kalori = MET × ağırlık_kg × süre_saat
export function calcExerciseCalories(
  exerciseType: string,
  durationMinutes: number,
  weightKg: number
): number {
  const met = EXERCISES[exerciseType]?.met ?? 4.0
  return Math.round(met * weightKg * (durationMinutes / 60))
}
```

---

## Makro Gram Hesabı

```
Protein:  1g = 4 kcal
Karbonhidrat: 1g = 4 kcal
Yağ:      1g = 9 kcal
```

```typescript
// Kalori hedefinden gram hedefi
proteinGoal_g = Math.round((calorieGoal * proteinRatio) / 4)
carbsGoal_g   = Math.round((calorieGoal * carbsRatio)   / 4)
fatGoal_g     = Math.round((calorieGoal * fatRatio)      / 9)
```