# Notification Flow & Partial Log Update Reference

## Notification Flow Diagram

```
useRecipeCalculation
      │
      │ (all ingredients done)
      ▼
isComplete = true
      │
      ├─► triggerRecipeCalculatedNotification()
      │       │
      │       └─► Notifications.scheduleNotificationAsync({ trigger: null })
      │               → fires immediately as local notification
      │
      └─► if pendingMealUpdate[recipeId] exists
              └─► updateMealTotals(mealId, finalCalories, finalCost)
                      └─► UPDATE meals SET calories=?, cost_tl=? WHERE id=?
                      └─► recalculate daily_log totals
```

## Partial Log Update Implementation

### dailyStore.ts additions

```typescript
// stores/dailyStore.ts

// Add to store state:
pendingMealUpdates: Record<string, string>  // recipeId → mealId

// Add action:
addPendingMealUpdate: (recipeId: string, mealId: string) => void
clearPendingMealUpdate: (recipeId: string) => void
```

### When user taps "Günlüğe Ekle" before isComplete

```typescript
async function handleAddToLog(
  recipe: TheMealDBRecipe,
  calc: RecipeCalcResult,
  servings: number
) {
  // Add meal with currently available (possibly partial) values
  const mealId = await addMeal({
    recipeId: recipe.id,
    calories: calc.totalCalories ?? 0,
    costTL: calc.totalCost ?? 0,
    protein: calc.totalProtein ?? 0,
    carbs: calc.totalCarbs ?? 0,
    fat: calc.totalFat ?? 0,
    servings,
  })

  if (!calc.isComplete) {
    // Register for later update
    dailyStore.addPendingMealUpdate(recipe.id, mealId)

    showToast({
      message: 'Tarif henüz tam hesaplanmadı. Hesaplama bitince günlük güncellenir.',
      type: 'warning',
      duration: 4000,
    })
  }
}
```

### When useRecipeCalculation completes

```typescript
// In useRecipeCalculation.ts, inside the isComplete useEffect:

useEffect(() => {
  if (!isComplete || totalCount === 0) return

  // 1. Fire notification
  triggerRecipeCalculatedNotification({ recipeName, totalCalories, totalCost })

  // 2. Update pending meal log entry if exists
  const pendingMealId = dailyStore.pendingMealUpdates[recipeId]
  if (pendingMealId) {
    updateMealTotals(pendingMealId, {
      calories: totalCalories ?? 0,
      costTL: totalCost ?? 0,
      protein: totalProtein ?? 0,
      carbs: totalCarbs ?? 0,
      fat: totalFat ?? 0,
    })
    dailyStore.clearPendingMealUpdate(recipeId)
  }
}, [isComplete])
```

### db/queries/meals.ts additions

```typescript
// New query function needed:

export async function updateMealTotals(
  mealId: string,
  totals: {
    calories: number
    costTL: number
    protein: number
    carbs: number
    fat: number
  }
): Promise<void> {
  await db.runAsync(
    `UPDATE meals
     SET calories = ?, protein_g = ?, carbs_g = ?, fat_g = ?, cost_tl = ?
     WHERE id = ?`,
    [totals.calories, totals.protein, totals.carbs, totals.fat, totals.costTL, mealId]
  )

  // Recalculate daily_log totals for the day this meal belongs to
  await recalculateDailyTotals(mealId)
}

async function recalculateDailyTotals(mealId: string): Promise<void> {
  // Get log_id for this meal
  const meal = await db.getFirstAsync<{ log_id: string }>(
    'SELECT log_id FROM meals WHERE id = ?', [mealId]
  )
  if (!meal) return

  // Recalculate from all meals in that log
  const totals = await db.getFirstAsync<{
    total_calories: number
    total_protein_g: number
    total_carbs_g: number
    total_fat_g: number
    total_spending_tl: number
  }>(
    `SELECT
      SUM(calories) as total_calories,
      SUM(protein_g) as total_protein_g,
      SUM(carbs_g) as total_carbs_g,
      SUM(fat_g) as total_fat_g,
      SUM(cost_tl) as total_spending_tl
     FROM meals WHERE log_id = ?`,
    [meal.log_id]
  )
  if (!totals) return

  await db.runAsync(
    `UPDATE daily_log
     SET total_calories = ?, total_protein_g = ?, total_carbs_g = ?,
         total_fat_g = ?, total_spending_tl = ?
     WHERE id = ?`,
    [
      totals.total_calories,
      totals.total_protein_g,
      totals.total_carbs_g,
      totals.total_fat_g,
      totals.total_spending_tl,
      meal.log_id,
    ]
  )
}
```

## Deep Link on Notification Tap

```typescript
// app/_layout.tsx

// Inside root layout component:
useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data as {
      recipeId?: string
      source?: 'recipes' | 'discover'
    }

    if (data?.recipeId) {
      if (data.source === 'discover') {
        router.push(`/(tabs)/discover/${data.recipeId}`)
      } else {
        router.push(`/(tabs)/recipes/${data.recipeId}`)
      }
    }
  })
  return () => sub.remove()
}, [])
```

Pass `source` in notification data to know which tab to navigate to:

```typescript
// In triggerRecipeCalculatedNotification:
data: {
  recipeId: recipe.id,
  recipeName: recipe.name,
  source: 'discover', // or 'recipes'
}
```

## Notification Permission Check

Before calling `triggerRecipeCalculatedNotification`, verify permission:

```typescript
async function triggerRecipeCalculatedNotification(params) {
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') return  // silently skip — don't prompt here

  await Notifications.scheduleNotificationAsync({ ... })
}
```

Notification permission is requested once after onboarding — don't re-prompt here.
If permission was denied, the calculation still completes; user just won't see the notification.
In-app snackbar should still appear even if notification permission is denied.

## In-App Snackbar (When App is Open)

When the app is in the foreground, the OS notification may or may not appear
(depends on iOS/Android settings). Always show an in-app snackbar as well:

```typescript
// In useRecipeCalculation.ts, isComplete useEffect:

if (isComplete) {
  // Always show in-app snackbar regardless of notification permission
  showSnackbar({
    message: `✅ Hesaplama tamamlandı — ${Math.round(totalCalories ?? 0)} kcal · ₺${(totalCost ?? 0).toFixed(2)}`,
    action: {
      label: 'Düzenle',
      onPress: () => router.push(`/(tabs)/recipes/${recipeId}`),
    },
    duration: 5000,
  })

  // Also fire local notification (for when user navigates away)
  triggerRecipeCalculatedNotification(...)
}
```

`showSnackbar` → use `Toast.tsx` (existing) or a dedicated `Snackbar.tsx` with action button support.
