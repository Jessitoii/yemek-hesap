---
name: api-integration
description: Use when calling an external API (Migros, TheMealDB, OpenFoodFacts, USDA, MyMemory, Unsplash, Cerebras) or adding a new service in KaloriTabak. Triggers on "Migros'tan fiyat çek", "tarif ara", "kalori getir", "çevir", "API çağrısı".
---

# API Integration Skill

## Use this skill when
- Calling any external API listed below
- Adding a new service to `services/`
- Implementing the caching layer for an API call

## Do not use this skill when
- Reading from SQLite (use `db/queries/` directly)
- Building UI components

## Supported APIs & Cache Strategy

| API | Service file | Cache | Expiry |
|---|---|---|---|
| Migros | `services/migros.ts` | `migros_cache` SQLite | 24h |
| TheMealDB | `services/themealdb.ts` | On save to recipes table | Permanent |
| OpenFoodFacts | `services/openfoodfacts.ts` | `calorie_cache` SQLite | Permanent |
| USDA | `services/usda.ts` | `calorie_cache` SQLite | Permanent |
| MyMemory | `services/mymemory.ts` | `translations` SQLite | Permanent |
| Unsplash | `services/unsplash.ts` | No cache | — |
| Cerebras | `services/cerebras.ts` | No cache | — |

## Instructions

### Calling Migros (with cache)
```typescript
// hooks/useMigrosSearch.ts handles debounce + cache for you
// In a service, use the pattern:
import { getMigrosCache, setMigrosCache } from '@/db/queries/cache'
import { searchMigrosProducts } from '@/services/migros'

const cached = await getMigrosCache(query)
if (cached) return cached

const results = await searchMigrosProducts(query)
await setMigrosCache(query, results)
return results
```

### Calling MyMemory (translate ingredient)
Always use the `useTranslate` hook in components, or call directly:
```typescript
import { translateToTurkish } from '@/services/mymemory'
const turkish = await translateToTurkish('spring onion')
// Auto-caches in SQLite. Returns English name if limit reached.
```

### Nutrition Fallback Chain
```typescript
import { getNutritionFromOFF } from '@/services/openfoodfacts'
import { getNutritionFromUSDA } from '@/services/usda'
import { getCalorieCache, setCalorieCache } from '@/db/queries/cache'

async function getNutrition(query: string): Promise<NutritionData | null> {
  const cached = await getCalorieCache(query)
  if (cached) return cached

  const off = await getNutritionFromOFF(query)
  if (off) { await setCalorieCache(query, off); return off }

  const usda = await getNutritionFromUSDA(query)
  if (usda) { await setCalorieCache(query, usda); return usda }

  return null // → prompt user for manual input
}
```

### Error Handling Pattern
```typescript
try {
  const results = await callApi(query)
  return results
} catch (error) {
  console.warn('[ServiceName] API error:', error)
  return [] // or null — never throw in service functions
}
```

### Price Calculation from Migros
```typescript
// priceKurus = Migros shownPrice (e.g. 4625 = 46.25 TL for 1000g)
// productGrams = the product's net weight in grams
// usedGrams = how many grams the recipe uses

const costTL = (priceKurus / 100 / productGrams) * usedGrams
```

## References
- Full API docs: `docs/09-api-integrations.md`
- Architecture: `docs/02-architecture.md`