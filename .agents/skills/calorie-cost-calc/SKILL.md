---
name: calorie-cost-calc
description: Use when implementing calorie calculation, macro calculation, recipe cost calculation, BMR/TDEE, unit conversion, or the smart recipe suggestion logic in KaloriTabak. Triggers on "kalori hesapla", "maliyet hesapla", "BMR", "TDEE", "makro", "birim dönüştür", "porsiyon".
---

# Calorie & Cost Calculation Skill

## Use this skill when
- Calculating calories or cost for a recipe or meal item
- Converting units (gram, ml, kaşık, bardak, adet...) to grams
- Computing BMR, TDEE, or goal-based daily targets
- Implementing smart recipe suggestion logic

## Instructions

### Unit → Grams Conversion
```typescript
// utils/unitConverter.ts
import { densityTable } from '@/utils/densityTable'

export function toGrams(amount: number, unit: string, ingredientName: string): number | null {
  if (unit === 'gram' || unit === 'ml') return amount

  const key = ingredientName.toLowerCase().trim()
  const density = densityTable[key]
  if (!density) return null // prompt user for manual gram input

  const gramsPerUnit: Record<string, number> = {
    'çay kaşığı':    density.teaspoon  ?? 5,
    'yemek kaşığı':  density.tablespoon ?? 15,
    'bardak':        density.cup       ?? 200,
    'adet':          density.piece     ?? density.gram_per_piece ?? null,
    'dilim':         density.slice     ?? null,
    'avuç':          density.handful   ?? 30,
  }

  const gramsPerOne = gramsPerUnit[unit]
  if (!gramsPerOne) return null
  return amount * gramsPerOne
}
```

### Calorie Calculation for a Meal Item
```typescript
// calories = (kcal_per_100g / 100) × grams
const calories = (ingredient.calories_per_100g / 100) * amountInGrams
const protein  = (ingredient.protein_per_100g  / 100) * amountInGrams
const carbs    = (ingredient.carbs_per_100g    / 100) * amountInGrams
const fat      = (ingredient.fat_per_100g      / 100) * amountInGrams
```

### Cost Calculation
```typescript
// utils/priceCalc.ts
// priceKurus: Migros shownPrice (e.g. 4625 = 46.25 TL per package)
// productGrams: net weight of the Migros product
// usedGrams: grams used in the recipe

export function calcCostTL(
  priceKurus: number,
  productGrams: number,
  usedGrams: number
): number {
  return (priceKurus / 100 / productGrams) * usedGrams
}
```

### BMR & TDEE (Mifflin-St Jeor)
```typescript
// utils/calorieCalc.ts
export function calcBMR(gender: 'male' | 'female', weight: number, height: number, age: number): number {
  const base = (10 * weight) + (6.25 * height) - (5 * age)
  return gender === 'male' ? base + 5 : base - 161
}

export function calcTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725,
  }
  return Math.round(bmr * (multipliers[activityLevel] ?? 1.2))
}
```

### Goal-Based Calorie & Macro Targets
```typescript
export function calcGoalTargets(tdee: number, goal: string) {
  const calorieMap: Record<string, number> = {
    lose_weight: tdee - 500, gain_weight: tdee + 500,
    stay_fit: tdee, eat_healthy: tdee, reduce_spending: tdee,
  }
  const macroMap: Record<string, { protein: number; carbs: number; fat: number }> = {
    lose_weight:     { protein: 0.30, carbs: 0.40, fat: 0.30 },
    gain_weight:     { protein: 0.30, carbs: 0.50, fat: 0.20 },
    stay_fit:        { protein: 0.25, carbs: 0.50, fat: 0.25 },
    eat_healthy:     { protein: 0.25, carbs: 0.45, fat: 0.30 },
    reduce_spending: { protein: 0.25, carbs: 0.50, fat: 0.25 },
  }
  const cal   = calorieMap[goal] ?? tdee
  const split = macroMap[goal]
  return {
    calorieGoal: Math.round(cal),
    proteinGoal: Math.round((cal * split.protein) / 4),
    carbsGoal:   Math.round((cal * split.carbs)   / 4),
    fatGoal:     Math.round((cal * split.fat)      / 9),
  }
}
```

### Smart Recipe Suggestion Logic
```typescript
// utils/recipeSuggestion.ts
export function getSuggestion(remaining: number, recipes: Recipe[], macroGaps: MacroGaps) {
  if (remaining < 0) return null // goal exceeded

  const eligible = recipes.filter(r => r.total_calories < remaining * 0.9)

  if (remaining < 1000) {
    // Single suggestion, ranked by macro gap
    return rankByMacroGap(eligible, macroGaps)[0] ?? null
  } else {
    // 3 random suggestions from macro-matching recipes
    return shuffle(eligible).slice(0, 3)
  }
}
```

## References
- Feature spec: `docs/01-features.md` (sections 3.3, 5.5, 6.3)
- Onboarding calcs: `docs/08-onboarding.md`