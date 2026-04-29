---
name: recipe-background-loading
description: Use this skill when implementing background calculation (calories, cost, macros) for TheMealDB recipes in BOTH the Recipes tab AND the Discover tab — including optimistic UI loading, per-ingredient skeleton states, enabling "Günlüğe Ekle / Add to Log" button before calculation completes, partial log updates after calculation finishes, and local completion notifications. Also use when the Recipes tab already has progressive rendering but is missing the early "Add to Log" option or completion notification.
---

# Recipe Background Loading & Optimistic UI

## Use this skill when
- Implementing or modifying recipe detail screens that load TheMealDB data (either tab)
- Adding background calorie/cost calculation with progressive UI updates in either tab
- Enabling "Günlüğe Ekle" button in Recipes tab before full calculation completes
- Enabling "Günlüğe Ekle" button in Discover tab before full calculation completes
- Adding in-app snackbar + local notification when calculation finishes (both tabs)
- Updating the daily log entry with final values after an early "Add to Log" tap
- Fixing Discover tab recipe detail (currently shows only a spinner — needs full rewrite)
- Fixing Recipes tab recipe detail (already has progressive rendering — needs early Add to Log + completion notification only)

## Do not use this skill when
- Working with user-created custom recipes (already fully calculated at save time)
- Working with ingredient-only searches (Add Meal Item screen)
- Implementing the Migros search or translation logic itself

---

## Architecture Overview

Recipe detail loading is split into two layers:

**Layer 1 — Instant (0ms):** TheMealDB data already in cache or fetched once.
Renders immediately: recipe name, image, cuisine, instructions, ingredient names + measures.

**Layer 2 — Background (async, per ingredient):** For each ingredient:
  1. Translate EN → TR via MyMemory (check `translations` cache first)
  2. Search Migros with Turkish name (check `migros_cache` first)
  3. Fetch nutrition: check `calorie_cache` → OpenFoodFacts → USDA fallback
  4. Convert measure to grams via `unitConverter`
  5. Calculate cost + calories for that ingredient
  6. Update that ingredient's row in UI state

As each ingredient resolves, its skeleton shimmer → real values.
Totals (calories, cost, macros) update incrementally as ingredients resolve.

---

## Affected Files

### Screens
- `app/(tabs)/recipes/[id].tsx` — Recipes tab recipe detail
- `app/(tabs)/discover/[id].tsx` — Discover tab recipe detail ← needs full rewrite

### Components
- `components/recipes/IngredientRow.tsx` — must support `isLoading` prop
- `components/recipes/RecipeDetailHeader.tsx` — must support skeleton totals
- `components/ui/SkeletonRow.tsx` — create if not exists

### Services / Hooks
- `hooks/useRecipeCalculation.ts` — create: orchestrates background calculation
- `hooks/useNotifications.ts` — extend: add `triggerRecipeCalculatedNotification`

### Stores
- `stores/recipesStore.ts` — add calculation state tracking per recipe

---

## Step-by-Step Implementation

### Step 1 — Create `hooks/useRecipeCalculation.ts`

This hook is the core engine. It takes a parsed TheMealDB recipe and returns
live-updating ingredient data as calculations resolve.

```typescript
// hooks/useRecipeCalculation.ts

import { useState, useEffect, useCallback } from 'react'
import { translateToTurkish } from '@/services/mymemory'
import { searchMigrosProducts } from '@/services/migros'
import { getNutritionFromOFF } from '@/services/openfoodfacts'
import { getNutritionFromUSDA } from '@/services/usda'
import { convertToGrams } from '@/utils/unitConverter'
import { parseMeasure } from '@/utils/unitConverter'
import { triggerRecipeCalculatedNotification } from '@/hooks/useNotifications'

export type IngredientCalcState = {
  nameEn: string
  nameTr: string | null
  measure: string
  grams: number | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  costTL: number | null
  migrosProduct: MigrosProduct | null
  status: 'pending' | 'calculating' | 'done' | 'error'
  requiresManualInput: boolean
}

export type RecipeCalcResult = {
  ingredients: IngredientCalcState[]
  totalCalories: number | null
  totalCost: number | null
  totalProtein: number | null
  totalCarbs: number | null
  totalFat: number | null
  isComplete: boolean
  completedCount: number
  totalCount: number
}

const UNPARSEABLE_MEASURES = ['to taste', 'some', 'a pinch', 'as needed', 'q.s.']

export function useRecipeCalculation(
  rawIngredients: { nameEn: string; measure: string }[]
): RecipeCalcResult {
  const [ingredients, setIngredients] = useState<IngredientCalcState[]>(
    rawIngredients.map(i => ({
      nameEn: i.nameEn,
      nameTr: null,
      measure: i.measure,
      grams: null,
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      costTL: null,
      migrosProduct: null,
      status: 'pending',
      requiresManualInput: UNPARSEABLE_MEASURES.some(u =>
        i.measure.toLowerCase().includes(u)
      ),
    }))
  )

  const updateIngredient = useCallback(
    (index: number, update: Partial<IngredientCalcState>) => {
      setIngredients(prev => {
        const next = [...prev]
        next[index] = { ...next[index], ...update }
        return next
      })
    },
    []
  )

  useEffect(() => {
    // Process each ingredient independently — parallel, not sequential
    rawIngredients.forEach(async (raw, index) => {
      if (UNPARSEABLE_MEASURES.some(u => raw.measure.toLowerCase().includes(u))) {
        updateIngredient(index, { status: 'done', requiresManualInput: true })
        return
      }

      updateIngredient(index, { status: 'calculating' })

      try {
        // 1. Translate
        const nameTr = await translateToTurkish(raw.nameEn)

        // 2. Parse measure → grams
        const parsed = parseMeasure(raw.measure)
        const grams = convertToGrams(raw.nameEn, parsed.amount, parsed.unit)

        // 3. Migros search (best match = first result)
        let migrosProduct: MigrosProduct | null = null
        let costTL: number | null = null
        try {
          const results = await searchMigrosProducts(nameTr)
          if (results.length > 0) {
            migrosProduct = results[0]
            // Assume product is sold per 1000g (typical for liquids/bulk)
            // or per piece. Use unit price if available.
            if (grams && migrosProduct) {
              const productGrams = estimateProductGrams(migrosProduct)
              costTL = (migrosProduct.priceTL / productGrams) * grams
            }
          }
        } catch {
          // Migros unavailable — cost stays null
        }

        // 4. Nutrition: calorie_cache → OFF → USDA
        let nutrition = null
        nutrition = await getNutritionFromOFF(raw.nameEn)
        if (!nutrition) nutrition = await getNutritionFromUSDA(raw.nameEn)

        const calories = nutrition && grams
          ? (nutrition.calories / 100) * grams
          : null
        const protein = nutrition && grams && nutrition.protein
          ? (nutrition.protein / 100) * grams : null
        const carbs = nutrition && grams && nutrition.carbs
          ? (nutrition.carbs / 100) * grams : null
        const fat = nutrition && grams && nutrition.fat
          ? (nutrition.fat / 100) * grams : null

        updateIngredient(index, {
          nameTr,
          grams,
          calories,
          protein,
          carbs,
          fat,
          costTL,
          migrosProduct,
          status: 'done',
        })
      } catch {
        updateIngredient(index, { status: 'error' })
      }
    })
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derived totals — recalculated on every ingredient update
  const doneIngredients = ingredients.filter(i => i.status === 'done')
  const completedCount = doneIngredients.length
  const totalCount = ingredients.length
  const isComplete = completedCount === totalCount

  const sum = (key: keyof IngredientCalcState) =>
    doneIngredients.some(i => i[key] !== null)
      ? doneIngredients.reduce((acc, i) => acc + ((i[key] as number) ?? 0), 0)
      : null

  const totalCalories = sum('calories')
  const totalCost = sum('costTL')
  const totalProtein = sum('protein')
  const totalCarbs = sum('carbs')
  const totalFat = sum('fat')

  // Fire notification when ALL ingredients are done
  useEffect(() => {
    if (isComplete && totalCount > 0) {
      triggerRecipeCalculatedNotification({
        recipeName: '', // caller passes recipe name separately — see usage below
        totalCalories,
        totalCost,
      })
    }
  }, [isComplete])

  return {
    ingredients,
    totalCalories,
    totalCost,
    totalProtein,
    totalCarbs,
    totalFat,
    isComplete,
    completedCount,
    totalCount,
  }
}

// Helper — rough gram estimate from Migros product name/unit
function estimateProductGrams(product: MigrosProduct): number {
  const name = product.name.toLowerCase()
  const gramMatch = name.match(/(\d+)\s*(gr|g|kg|ml|l|lt)\b/)
  if (gramMatch) {
    const amount = parseInt(gramMatch[1])
    const unit = gramMatch[2]
    if (unit === 'kg' || unit === 'l' || unit === 'lt') return amount * 1000
    return amount
  }
  return 1000 // default assumption
}
```

---

### Step 2 — Extend `hooks/useNotifications.ts`

Add `triggerRecipeCalculatedNotification`. This fires a local notification
immediately (trigger: null) when background calculation finishes.

```typescript
// Add to hooks/useNotifications.ts

export async function triggerRecipeCalculatedNotification({
  recipeName,
  totalCalories,
  totalCost,
}: {
  recipeName: string
  totalCalories: number | null
  totalCost: number | null
}) {
  const calStr = totalCalories ? `${Math.round(totalCalories)} kcal` : 'Kalori hesaplanamadı'
  const costStr = totalCost ? `₺${totalCost.toFixed(2)}` : 'Fiyat hesaplanamadı'

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `✅ "${recipeName}" hesaplandı`,
      body: `${calStr} · ${costStr} — Düzenlemek için dokunun.`,
      data: { recipeName }, // used to deep-link back to recipe on tap
    },
    trigger: null, // fires immediately
  })
}
```

**Note:** Notification tap → deep link handler should navigate to the recipe detail.
Add a `Notifications.addNotificationResponseReceivedListener` in `app/_layout.tsx`
that reads `response.notification.request.content.data.recipeName` and routes accordingly.

---

### Step 3 — Update `IngredientRow.tsx`

Add `isLoading` prop. When true, show skeleton shimmer instead of values.

```typescript
// components/recipes/IngredientRow.tsx

type Props = {
  ingredient: IngredientCalcState
  // ...existing props
}

// In render:
// If ingredient.status === 'pending' | 'calculating' → show SkeletonRow
// If ingredient.status === 'done' → show real data
// If ingredient.requiresManualInput → show "Miktar girin" prompt
// If ingredient.status === 'error' → show "—" with warning icon
```

Skeleton shimmer: use `react-native-reanimated` with a looping opacity animation
(0.4 → 0.8 → 0.4), applied to placeholder View elements matching the real layout.

---

### Step 4 — Update `RecipeDetailHeader.tsx`

Totals row (calories / cost / servings) should show skeleton while `!isComplete`.
As `totalCalories` and `totalCost` populate, animate the number counting up
(use `react-native-reanimated` shared value + `withTiming`).

Progress indicator below the totals row:
```
Hesaplanıyor... (8/20 malzeme)   [=====>        ]
```
Hide this row once `isComplete`.

---

### Step 5 — "Günlüğe Ekle" Button Behavior

The button is **always active** (not disabled during calculation).

**If tapped while `!isComplete`:**
- Use currently available partial values
- Ingredients still `pending/calculating`: their calories/cost counted as 0
- Show a Toast: "Tarif henüz tam hesaplanmadı. Mevcut verilerle eklendi. Hesaplama bitince güncellenir."
- After calculation completes: update the `meals` row in SQLite with final values
  and update `daily_log` totals accordingly

**If tapped while `isComplete`:**
- Normal flow — all values confirmed

**Implementation note:** Store a `pendingMealUpdate` flag in `dailyStore`.
When `useRecipeCalculation` completes, check if this recipe was added mid-calculation
and run `updateMealTotals(mealId, finalCalories, finalCost)`.

---

### Step 6 — Discover Tab: Rewrite `app/(tabs)/discover/[id].tsx`

Currently: fetch recipe → show spinner until done → render all at once.

New flow:

```typescript
// app/(tabs)/discover/[id].tsx

export default function DiscoverRecipeDetail() {
  const { id } = useLocalSearchParams()
  const [recipe, setRecipe] = useState<TheMealDBRecipe | null>(null)
  const [isFetchingRecipe, setIsFetchingRecipe] = useState(true)

  // Step 1: Fetch TheMealDB data (fast — usually <500ms)
  useEffect(() => {
    getRecipeById(id).then(r => {
      setRecipe(r)
      setIsFetchingRecipe(false)
    })
  }, [id])

  // Step 2: Start background calculation only after recipe data is ready
  const calc = useRecipeCalculation(recipe?.ingredients ?? [])

  if (isFetchingRecipe) {
    // Only show spinner for the TheMealDB fetch — typically <500ms
    return <FullScreenSpinner />
  }

  // From here: recipe renders immediately, calc updates progressively
  return (
    <RecipeDetailLayout
      recipe={recipe}
      calc={calc}
      onAddToLog={handleAddToLog}
      onAddToMyRecipes={handleAddToMyRecipes}
    />
  )
}
```

The spinner now only covers the TheMealDB network call, not the full calculation.

---

### Step 7 — Recipes Tab: `app/(tabs)/recipes/[id].tsx`

This screen already renders ingredients progressively (skeleton → real values per row).
It does NOT yet have early "Günlüğe Ekle" support or completion notification.

Required changes:

1. **Pass `calc` object** from `useRecipeCalculation` to the bottom bar and header
   (the hook likely already runs here — just expose `isComplete`, `completedCount`, `totalCount`)

2. **"Günlüğe Ekle" button:** Remove any `disabled={!isComplete}` guard.
   Button must be active from the moment the screen opens.
   On tap: call the same `handleAddToLog` logic from Step 5 (partial log + pending update).

3. **Progress bar in header:** Show `completedCount/totalCount` below the totals row
   (same component used in Discover tab — reuse `RecipeDetailHeader` or extract shared component).

4. **Completion notification + snackbar:** Call `triggerRecipeCalculatedNotification`
   and `showSnackbar` when `isComplete` becomes true — same as Discover tab.
   Pass `source: 'recipes'` in notification data for correct deep-link routing.

5. **No other changes needed** — skeleton rendering per ingredient already works.

---

## UI States Reference

| State | Ingredient Row | Totals Row | Button |
|---|---|---|---|
| pending | Skeleton shimmer | Skeleton | Active |
| calculating | Skeleton shimmer | Partial values | Active |
| done | Real values | Updated totals | Active |
| error | "—" + ⚠️ icon | Partial totals | Active |
| requiresManualInput | "Miktar girin" | Excluded from total | Active |
| isComplete | All real values | Final totals | Active |

---

## Notification Deep-Link Setup

Add to `app/_layout.tsx` (inside root layout, after notification handler setup):

```typescript
useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data
    if (data?.recipeName) {
      // Navigate to the recipe — use stored recipe ID if available
      // or search by name in recipesStore
      router.push(`/(tabs)/recipes/${data.recipeId}`)
    }
  })
  return () => sub.remove()
}, [])
```

Store `recipeId` in notification data alongside `recipeName` for reliable routing.

---

## Testing Checklist

- [ ] Discover tab: spinner shows only during TheMealDB fetch (~0.5s), not during calculation
- [ ] Ingredient rows appear immediately with skeleton, fill in one by one
- [ ] Totals update as each ingredient resolves (not all at once at the end)
- [ ] Progress bar shows "X/Y malzeme hesaplandı"
- [ ] "Günlüğe Ekle" works before calculation completes — toast shown
- [ ] After early "Ekle", meal row updates in DB when calculation finishes
- [ ] Local notification fires when calculation is 100% complete
- [ ] Tapping notification navigates to correct recipe
- [ ] Recipes tab: same behavior, no regression on existing progressive rendering
- [ ] Offline: if Migros unreachable, cost shows "—", calories still calculate
- [ ] Error state: if one ingredient fails entirely, others still render correctly