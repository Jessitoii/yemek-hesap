---
description: # Faz 0 — Temel Altyapı  **Amaç:** Uygulamanın çalışması için gereken her şeyin iskeleti. Bu faz bitmeden hiçbir UI yazılamaz.
---

## Checkpoint 0.1 — Proje Konfigürasyonu

Bu checkpoint'te uygulama `npx expo start` ile hatasız açılmalı.

### Görevler

- [ ] `package.json` — tüm bağımlılıklar tanımlı
  ```json
  {
    "dependencies": {
      "expo": "latest", "expo-router": "^3.0.0",
      "react-native": "latest", "typescript": "latest",
      "expo-sqlite": "latest", "zustand": "latest",
      "expo-pedometer": "latest", "expo-notifications": "latest",
      "expo-image-picker": "latest", "expo-camera": "latest",
      "react-native-health": "latest",
      "react-native-health-connect": "latest",
      "react-native-reanimated": "latest",
      "react-native-svg": "latest", "victory-native": "latest",
      "lottie-react-native": "latest",
      "phosphor-react-native": "latest",
      "@expo-google-fonts/nunito": "latest", "expo-font": "latest",
      "expo-linear-gradient": "latest", "expo-dev-client": "latest"
    }
  }
  ```

- [ ] `app.json`
  - name: "KaloriTabak", slug: "kalori-tabak", scheme: "kaloritabak"
  - plugins: expo-router, expo-sqlite, expo-notifications, expo-image-picker, expo-camera, expo-pedometer
  - HealthKit entitlements (iOS)

- [ ] `eas.json`
  - `development`: expo-dev-client, internal distribution
  - `preview`: internal distribution
  - `production`: store distribution

- [ ] `tsconfig.json`
  - strict: true
  - `"@/*": ["./*"]` path alias
  - baseUrl: "."

- [ ] `.env.example`
  ```
  EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=
  EXPO_PUBLIC_USDA_API_KEY=DEMO_KEY
  EXPO_PUBLIC_CEREBRAS_API_KEY=
  ```

**✓ Checkpoint 0.1 geçti:** `npx expo start` çalışıyor, TypeScript hata yok.

---

## Checkpoint 0.2 — Sabitler ve Tipler

Bu checkpoint'te tüm design token'ları ve TypeScript tipleri hazır olmalı.

### Görevler

**`constants/`**
- [ ] `colors.ts` — tam palet (`docs/06-ui-design.md`'den)
- [ ] `typography.ts` — Nunito font ailesi + boyutlar
- [ ] `theme.ts` — spacing, radius, shadow token'ları
- [ ] `exercises.ts` — egzersiz tipleri + MET değerleri
- [ ] `routes.ts` — typed route sabitleri

**`types/`**
- [ ] `user.ts` — `UserProfile`, `UserGoals`, `AppSettings`
- [ ] `recipe.ts` — `Recipe`, `RecipeIngredient`
- [ ] `ingredient.ts` — `Ingredient`, `MigrosProduct`, `NutritionData`
- [ ] `daily.ts` — `DailyLog`, `Meal`, `MealType`
- [ ] `activity.ts` — `Exercise`, `ExerciseType`, `StreakDay`
- [ ] `mealPlan.ts` — `MealPlan`, `MealPlanItem`
- [ ] `api.ts` — API response tipleri

**✓ Checkpoint 0.2 geçti:** `npx tsc --noEmit` sıfır hata.

---

## Checkpoint 0.3 — Utility Fonksiyonları

Pure fonksiyonlar — async yok, import yok (sadece kendi içinden).

### Görevler

- [ ] `utils/uuid.ts` — `generateId(): string`
- [ ] `utils/densityTable.ts` — 150+ malzeme, gram/birim eşdeğerleri
- [ ] `utils/unitConverter.ts` — `toGrams(amount, unit, ingredientName): number | null`
- [ ] `utils/calorieCalc.ts` — `calcBMR()`, `calcTDEE()`, `calcGoalTargets()`
- [ ] `utils/macroCalc.ts` — `calcMacrosFromGoal()`
- [ ] `utils/bodyFatCalc.ts` — Navy formula
- [ ] `utils/exerciseCalc.ts` — `calcExerciseCalories(type, minutes, weightKg)`
- [ ] `utils/recipeSuggestion.ts` — `getSuggestion(remaining, recipes, macroGaps)`
- [ ] `utils/priceCalc.ts` — `calcCostTL(priceKurus, productGrams, usedGrams)`
- [ ] `utils/formatters.ts` — `formatCurrency()`, `formatCalories()`, `formatDate()`

**✓ Checkpoint 0.3 geçti:** Her util fonksiyonu için basit birim test — beklenen değeri döndürüyor.

---

## Checkpoint 0.4 — Veritabanı Katmanı

SQLite bağlantısı, tüm migration'lar ve query fonksiyonları.

### Görevler

**`db/`**
- [ ] `db/index.ts` — bağlantı aç, migration runner (sıralı, yalnızca bir kez)
- [ ] `db/migrations/001_user.ts`
- [ ] `db/migrations/002_ingredients.ts`
- [ ] `db/migrations/003_recipes.ts`
- [ ] `db/migrations/004_recipe_ingredients.ts`
- [ ] `db/migrations/005_price_history.ts`
- [ ] `db/migrations/006_daily_log.ts`
- [ ] `db/migrations/007_meals.ts`
- [ ] `db/migrations/008_activity_log.ts`
- [ ] `db/migrations/009_streak.ts`
- [ ] `db/migrations/010_meal_plans.ts`
- [ ] `db/migrations/011_cache.ts`

**`db/queries/`**
- [ ] `user.ts` — `getUser()`, `updateUser()`, `updateGoals()`
- [ ] `recipes.ts` — `getRecipes()`, `getRecipeById()`, `saveRecipe()`, `deleteRecipe()`, `toggleFavorite()`
- [ ] `ingredients.ts` — `getIngredients()`, `saveIngredient()`, `deleteIngredient()`
- [ ] `dailyLog.ts` — `getLogByDate()`, `createLog()`, `updateLogTotals()`
- [ ] `meals.ts` — `getMealsByLogId()`, `addMeal()`, `deleteMeal()`
- [ ] `activity.ts` — `getActivityByDate()`, `addExercise()`, `updateSteps()`
- [ ] `streak.ts` — `getStreak()`, `markDayComplete()`, `getCurrentStreak()`
- [ ] `mealPlans.ts` — `savePlan()`, `getPlans()`, `deletePlan()`
- [ ] `cache.ts` — translation, calorie, migros cache CRUD + expiry temizliği

**✓ Checkpoint 0.4 geçti:** Uygulama açılışında migration'lar başarıyla çalışıyor, tablolar oluşuyor.

---

## Faz 0 Tamamlandı

**Kontrol et:**
- [ ] `npx expo start` — hatasız
- [ ] `npx tsc --noEmit` — sıfır hata
- [ ] SQLite tablolar oluşuyor (migration log'u kontrol et)
- [ ] `utils/` fonksiyonları beklenen değerleri döndürüyor

**Sonraki faz:** Faz 1 — Servisler ve Store'lar
