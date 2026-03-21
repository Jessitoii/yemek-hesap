---
trigger: model_decision
description: Kod Stili Kuralları
---

## TypeScript

- `strict: true` — `any` kullanma, her zaman `types/` altında tanımla
- Opsiyonel alanlar için `field?: Type`, asla `field: Type | undefined` yazma
- API response tipleri → `types/api.ts`
- Domain tipleri → ilgili dosya: `types/recipe.ts`, `types/user.ts` vb.
- Absolute import zorunlu: `@/stores/recipesStore` ✓ — `../../stores/recipesStore` ✗

## Dosya İsimlendirme

| Tür | Format | Örnek |
|---|---|---|
| Ekran (app/) | kebab-case.tsx | `add-meal.tsx` |
| Bileşen | PascalCase.tsx | `RecipeCard.tsx` |
| Store | camelCaseStore.ts | `recipesStore.ts` |
| Service | camelCase.ts | `migros.ts` |
| Hook | useCamelCase.ts | `useMigrosSearch.ts` |
| Util | camelCase.ts | `unitConverter.ts` |
| DB Query | camelCase.ts | `recipes.ts` |

## Veri Tipleri — Depolama Kuralları

- **ID'ler:** UUID string — her zaman `generateId()` kullan (`utils/uuid.ts`)
- **Tarihler:** `'YYYY-MM-DD'` string — `new Date().toISOString().split('T')[0]`
- **Fiyatlar:** Kuruş integer DB'de — `Math.round(fiyatTL * 100)` — yalnızca gösterimde TL'ye çevir
- **Boolean'lar SQLite'ta:** `0` veya `1` integer (SQLite'ın BOOLEAN tipi yok)

## Bileşen Yapısı

```typescript
// 1. React/RN importları
import { View, Text } from 'react-native'
// 2. Expo importları  
import { router } from 'expo-router'
// 3. Üçüncü parti
import { Heart } from 'phosphor-react-native'
// 4. Internal — absolute path
import { colors } from '@/constants/colors'
import { useRecipesStore } from '@/stores/recipesStore'
// 5. Tip importları
import type { Recipe } from '@/types/recipe'

// Interface props dosyanın hemen altında
interface Props {
  recipe: Recipe
  onPress: () => void
}

// Named export (default export yalnızca ekranlarda)
export function RecipeCard({ recipe, onPress }: Props) { ... }
```

## Store Seçici Paterni

```typescript
// ✓ Doğru — sadece ihtiyaç duyulan state seç (gereksiz render önler)
const recipes = useRecipesStore(state => state.recipes)
const addRecipe = useRecipesStore(state => state.addRecipe)

// ✗ Yanlış — tüm store'u seçme
const store = useRecipesStore()
```