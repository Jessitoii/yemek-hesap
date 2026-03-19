# 09 — API Integrations

## Overview

KaloriTabak integrates with 8 external services. All calls are made directly from the client — no proxy server, no backend. Each service has its own file in `services/`.

---

## 1. Migros API

**File:** `services/migros.ts`
**Purpose:** Real-time grocery product search with current prices
**Auth:** None required
**Cost:** Free (unofficial internal endpoint)

### Endpoint

```
GET https://www.migros.com.tr/rest/search/screens/products?q={query}
```

### Request

```typescript
export async function searchMigrosProducts(query: string): Promise<MigrosProduct[]> {
  const url = `https://www.migros.com.tr/rest/search/screens/products?q=${encodeURIComponent(query)}`

  const response = await fetch(url)
  if (!response.ok) throw new Error('Migros API unavailable')

  const json = await response.json()
  const items = json?.data?.searchInfo?.storeProductInfos ?? []

  return items.map((item: any): MigrosProduct => ({
    id:             String(item.id),
    name:           item.name,
    priceTL:        item.shownPrice / 100,
    priceKurus:     item.shownPrice,
    regularPriceTL: item.regularPrice / 100,
    discountRate:   item.discountRate ?? 0,
    unitPrice:      item.unitPrice ?? null,
    imageUrl:       item.images?.[0]?.urls?.PRODUCT_LIST ?? null,
    brand:          item.brand?.name ?? null,
    category:       item.category?.name ?? null,
  }))
}
```

### Response Shape (relevant fields)

```json
{
  "successful": true,
  "data": {
    "searchInfo": {
      "storeProductInfos": [
        {
          "id": 20000011011520,
          "name": "Migros %3 Yağlı Uht Süt 1 L",
          "shownPrice": 4625,
          "regularPrice": 4625,
          "discountRate": 0,
          "unitPrice": "(46,25 TL/Litre)",
          "images": [{ "urls": { "PRODUCT_LIST": "https://..." } }],
          "brand": { "name": "Migros" },
          "category": { "name": "Uzun Ömürlü Süt" }
        }
      ]
    }
  }
}
```

### Price Calculation

```typescript
// Cost of X grams of a product
function calculateCost(
  priceKurus: number,     // e.g. 4625 (= 46.25 TL for 1000g)
  productGrams: number,   // e.g. 1000 (product is 1L = ~1000g)
  usedGrams: number       // e.g. 240 (recipe uses 240g)
): number {
  const priceTL = priceKurus / 100
  return (priceTL / productGrams) * usedGrams
}
```

### Error Handling

- If Migros is down or returns unexpected structure → return empty array
- Show "Price unavailable, enter manually" in UI
- Do not crash the recipe creation flow

### Caching

- Check `migros_cache` SQLite table before calling API
- Cache key: search term (lowercased, trimmed)
- Cache expiry: 24 hours
- Debounce all search inputs: **500ms**

---

## 2. TheMealDB

**File:** `services/themealdb.ts`
**Purpose:** Recipe database with ingredients and measures
**Auth:** None required
**Cost:** Free

### Endpoints

```
GET https://www.themealdb.com/api/json/v1/1/search.php?s={query}
GET https://www.themealdb.com/api/json/v1/1/lookup.php?i={id}
GET https://www.themealdb.com/api/json/v1/1/random.php
GET https://www.themealdb.com/api/json/v1/1/filter.php?c={category}
GET https://www.themealdb.com/api/json/v1/1/filter.php?a={area}
GET https://www.themealdb.com/api/json/v1/1/categories.php
```

### Response Parsing

TheMealDB returns ingredients as flat fields (up to 20):

```typescript
export function parseMealDBRecipe(meal: any): TheMealDBRecipe {
  const ingredients: RawIngredient[] = []

  for (let i = 1; i <= 20; i++) {
    const name    = meal[`strIngredient${i}`]?.trim()
    const measure = meal[`strMeasure${i}`]?.trim()
    if (name && name !== '') {
      ingredients.push({ nameEn: name, measure: measure || '' })
    }
  }

  return {
    id:           meal.idMeal,
    name:         meal.strMeal,
    category:     meal.strCategory,
    cuisine:      meal.strArea,
    instructions: meal.strInstructions,
    imageUrl:     meal.strMealThumb,
    ingredients,
  }
}
```

### Measure Parsing

```typescript
// utils/unitConverter.ts
// Converts "3/4 cup" → { amount: 0.75, unit: 'cup' }

export function parseMeasure(measure: string): { amount: number; unit: string } {
  const cleaned = measure.trim().toLowerCase()

  // Handle fractions: "1/2", "3/4"
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)\s*(.*)$/)
  if (fractionMatch) {
    const amount = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])
    return { amount, unit: fractionMatch[3].trim() || 'piece' }
  }

  // Handle mixed numbers: "1 1/2"
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/)
  if (mixedMatch) {
    const amount = parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3])
    return { amount, unit: mixedMatch[4].trim() || 'piece' }
  }

  // Handle simple: "2 cups"
  const simpleMatch = cleaned.match(/^([\d.]+)\s*(.*)$/)
  if (simpleMatch) {
    return { amount: parseFloat(simpleMatch[1]), unit: simpleMatch[2].trim() || 'piece' }
  }

  return { amount: 1, unit: 'piece' }
}
```

### Unparseable Measures

If measure is "to taste", "some", "a pinch", "as needed":
- Flag ingredient as `requiresManualInput: true`
- Show in UI: "Enter amount for [ingredient name]"
- User enters grams manually

---

## 3. OpenFoodFacts

**File:** `services/openfoodfacts.ts`
**Purpose:** Calorie and macro data per 100g
**Auth:** None required
**Cost:** Free

### Endpoint

```
GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=5
```

### Request

```typescript
export async function getNutritionFromOFF(query: string): Promise<NutritionData | null> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`

  const response = await fetch(url)
  const json = await response.json()
  const products = json?.products ?? []

  for (const product of products) {
    const n = product.nutriments
    if (n?.['energy-kcal_100g']) {
      return {
        calories: Math.round(n['energy-kcal_100g']),
        protein:  n['proteins_100g']      ?? null,
        carbs:    n['carbohydrates_100g'] ?? null,
        fat:      n['fat_100g']           ?? null,
        source:   'openfoodfacts',
      }
    }
  }

  return null
}
```

### Fallback Chain

```
1. Check calorie_cache (SQLite)  →  found: return immediately
2. Call OpenFoodFacts API        →  found: cache + return
3. Call USDA FoodData Central    →  found: cache + return
4. Return null → ask user for manual input → cache manual entry
```

---

## 4. USDA FoodData Central

**File:** `services/usda.ts`
**Purpose:** Macro fallback when OpenFoodFacts has no data
**Auth:** Free API key (DEMO_KEY works for low usage)
**Cost:** Free

### Endpoint

```
GET https://api.nal.usda.gov/fdc/v1/foods/search?query={query}&api_key={key}&pageSize=5
```

### Request

```typescript
const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY ?? 'DEMO_KEY'

export async function getNutritionFromUSDA(query: string): Promise<NutritionData | null> {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=5`

  const response = await fetch(url)
  const json = await response.json()
  const foods = json?.foods ?? []
  if (foods.length === 0) return null

  const nutrients = foods[0].foodNutrients ?? []
  const find = (name: string) =>
    nutrients.find((n: any) => n.nutrientName?.toLowerCase().includes(name))?.value ?? null

  return {
    calories: find('energy'),
    protein:  find('protein'),
    carbs:    find('carbohydrate'),
    fat:      find('total lipid'),
    source:   'usda',
  }
}
```

### Rate Limits
- DEMO_KEY: 30 req/hour, 50 req/day
- Since USDA is fallback-only and results are cached permanently, DEMO_KEY is sufficient

---

## 5. MyMemory Translation

**File:** `services/mymemory.ts`
**Purpose:** Translate TheMealDB ingredient names from English to Turkish
**Auth:** None (optional email for higher limit)
**Cost:** Free (1,000 req/day without email)

### Endpoint

```
GET https://api.mymemory.translated.net/get?q={text}&langpair=en|tr
```

### Request

```typescript
export async function translateToTurkish(text: string): Promise<string> {
  const cached = await getTranslation(text)
  if (cached) return cached

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|tr`
  const response = await fetch(url)
  const json = await response.json()

  const translated = json?.responseData?.translatedText
  if (!translated || json?.responseStatus !== 200) return text

  await setTranslation(text, translated)
  return translated
}
```

### Cache Strategy
- All translations cached permanently in `translations` SQLite table
- Same term never translated twice
- If limit reached and not cached → return English name with `(EN)` suffix

---

## 6. Unsplash

**File:** `services/unsplash.ts`
**Purpose:** Food images for custom recipes and ingredients
**Auth:** Free API key required
**Cost:** Free (50 req/hour)

### Setup

Register at [unsplash.com/developers](https://unsplash.com/developers).

```
EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here
```

### Endpoint

```
GET https://api.unsplash.com/search/photos?query={query}&client_id={key}&per_page=5&orientation=landscape
```

### Request

```typescript
export async function searchUnsplashImages(query: string): Promise<ImageResult[]> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' food')}&client_id=${ACCESS_KEY}&per_page=5&orientation=landscape`

  const response = await fetch(url)
  const json = await response.json()

  return (json?.results ?? []).map((photo: any): ImageResult => ({
    id:       photo.id,
    url:      photo.urls.regular,
    thumbUrl: photo.urls.thumb,
    credit:   photo.user.name,
  }))
}
```

---

## 7. DDGS (DuckDuckGo Image Search)

**File:** `services/ddgs.ts`
**Purpose:** Secondary image fallback
**Auth:** None (unofficial)
**Cost:** Free

> ⚠️ Unofficial endpoint. May break without notice. Used only as last resort before placeholder image.

### Image Fallback Chain

```
1. TheMealDB strMealThumb      →  TheMealDB recipes only
2. Unsplash search             →  custom recipes / ingredients
3. DDGS search                 →  if Unsplash fails
4. Placeholder image           →  if all sources fail
```

---

## 8. Cerebras API

**File:** `services/cerebras.ts`
**Purpose:** AI meal plan generation (fallback to rule engine)
**Auth:** Free API key required
**Cost:** Free tier available

### Setup

```
EXPO_PUBLIC_CEREBRAS_API_KEY=your_key_here
```

### Endpoint

```
POST https://api.cerebras.ai/v1/chat/completions
```

### Request

```typescript
export async function generateMealPlan(params: MealPlanParams): Promise<MealPlanResult> {
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen-3-235b-a22b-instruct-2507',
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition expert. Respond ONLY with valid JSON. No markdown, no explanation.',
        },
        {
          role: 'user',
          content: buildMealPlanPrompt(params),
        },
      ],
    }),
  })

  const json = await response.json()
  const text = json?.choices?.[0]?.message?.content ?? ''
  return JSON.parse(text) as MealPlanResult
}
```

### Usage Flow

```
User taps "Generate Plan"
    ↓
Rule engine (uses saved recipes)
    ↓ Enough recipes (≥10)    ↓ Not enough recipes
Return plan immediately    Call Cerebras API
                               ↓ Success → return plan
                               ↓ Failure → show error
```

> Cerebras is only called for multi-day meal plan generation. Daily smart recipe suggestions use the rule engine only — no API call.

---

## Environment Variables

```bash
# .env (never commit to git)
EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here
EXPO_PUBLIC_USDA_API_KEY=your_key_here
EXPO_PUBLIC_CEREBRAS_API_KEY=your_key_here
```

---

## Service Summary

| Service | File | Auth | Daily Limit | Cached |
|---|---|---|---|---|
| Migros | `services/migros.ts` | None | Unknown | 24h |
| TheMealDB | `services/themealdb.ts` | None | Unlimited | On save |
| OpenFoodFacts | `services/openfoodfacts.ts` | None | Unlimited | Permanent |
| USDA FoodData | `services/usda.ts` | API key | 50 (DEMO) | Permanent |
| MyMemory | `services/mymemory.ts` | None | 1,000/day | Permanent |
| Unsplash | `services/unsplash.ts` | API key | 50/hour | No |
| DDGS | `services/ddgs.ts` | None | Unknown | No |
| Cerebras | `services/cerebras.ts` | API key | Free tier | No |

---

## TypeScript Types

```typescript
// types/api.ts

export interface MigrosProduct {
  id:             string
  name:           string
  priceTL:        number
  priceKurus:     number
  regularPriceTL: number
  discountRate:   number
  unitPrice:      string | null
  imageUrl:       string | null
  brand:          string | null
  category:       string | null
}

export interface NutritionData {
  calories: number
  protein:  number | null
  carbs:    number | null
  fat:      number | null
  source:   'openfoodfacts' | 'usda' | 'manual'
}

export interface ImageResult {
  id:       string
  url:      string
  thumbUrl: string
  credit:   string
}

export interface TheMealDBRecipe {
  id:           string
  name:         string
  category:     string
  cuisine:      string
  instructions: string
  imageUrl:     string
  ingredients:  RawIngredient[]
}

export interface RawIngredient {
  nameEn:  string
  measure: string
}

export interface MealPlanParams {
  days:        number
  calorieGoal: number
  budgetGoal:  number
  proteinGoal: number
  carbsGoal:   number
  fatGoal:     number
}
```
