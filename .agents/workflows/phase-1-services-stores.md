---
description: # Faz 1 — Servisler, Store'lar ve Hook'lar  **Ön koşul:** Faz 0 tamamlandı (özellikle `db/queries/` ve `types/`)  **Amaç:** UI olmadan test edilebilen iş mantığı katmanı. Store'lar hazır olunca her ekran veri çekebilir.
---

## Checkpoint 1.1 — Dış API Servisleri

Pure async fonksiyonlar — React yok, state yok, her zaman try/catch.

### Görevler

- [ ] `services/migros.ts`
  - `searchMigrosProducts(query): Promise<MigrosProduct[]>`
  - Response: `json?.data?.searchInfo?.storeProductInfos ?? []`
  - Fiyat: `shownPrice / 100` (kuruş → TL)
  - Hata → boş array döndür

- [ ] `services/themealdb.ts`
  - `searchRecipes(query)`, `getRecipeById(id)`, `getRandom()`, `getCategories()`, `filterByCategory(c)`, `filterByCuisine(a)`
  - `parseMealDBRecipe(meal)` — flat ingredient field'larını array'e çevir (1-20)
  - `parseMeasure("3/4 cup")` → `{ amount: 0.75, unit: 'cup' }`
  - Ayrıştırılamayan ölçü → `requiresManualInput: true`

- [ ] `services/openfoodfacts.ts`
  - `getNutritionFromOFF(query): Promise<NutritionData | null>`
  - `energy-kcal_100g` alanı yoksa null döndür

- [ ] `services/usda.ts`
  - `getNutritionFromUSDA(query): Promise<NutritionData | null>`
  - `DEMO_KEY` fallback — günlük 50 istek yeterli (sadece fallback)

- [ ] `services/mymemory.ts`
  - `translateToTurkish(text): Promise<string>`
  - Önce `translations` cache kontrol et
  - Başarısız → İngilizce adı döndür

- [ ] `services/unsplash.ts`
  - `searchImages(query): Promise<ImageResult[]>`

- [ ] `services/ddgs.ts`
  - `searchImages(query): Promise<ImageResult[]>`
  - Gayri-resmi — hata durumunda sessizce boş array döndür

- [ ] `services/cerebras.ts`
  - `generateMealPlan(params): Promise<MealPlanResult>`
  - System prompt: "Yalnızca geçerli JSON döndür. Markdown yok, açıklama yok."
  - JSON parse başarısız → hata fırlat (caller handle eder)

- [ ] `services/health.ts`
  - Platform-aware wrapper: iOS → react-native-health, Android → react-native-health-connect
  - `requestHealthPermissions()`, `getTodaySteps()`, `writeCaloriesConsumed()`

**✓ Checkpoint 1.1 geçti:** Her servis fonksiyonu gerçek API ile manuel test edildi.

---

## Checkpoint 1.2 — Zustand Store'ları

Store'lar DB'yi başlatır ve in-memory state tutar. UI store'lardan okur.

### Görevler

- [ ] `stores/userStore.ts`
  ```typescript
  { profile, goals, settings, onboardingCompleted,
    loadUser(), updateProfile(), updateGoals(), updateSettings() }
  ```

- [ ] `stores/recipesStore.ts`
  ```typescript
  { recipes, ingredients, favorites, isLoading,
    loadRecipes(), addRecipe(), deleteRecipe(), toggleFavorite(),
    loadIngredients(), addIngredient(), deleteIngredient() }
  ```

- [ ] `stores/dailyStore.ts`
  ```typescript
  { selectedDate, todayLog, meals, suggestion, isLoading,
    loadLog(date), addMeal(), deleteMeal(), updateSuggestion() }
  ```
  - `addMeal()` sonrası `updateLogTotals()` + kalori uyarısı tetikle
  - `updateSuggestion()` → `utils/recipeSuggestion.ts` kullan

- [ ] `stores/activityStore.ts`
  ```typescript
  { todaySteps, burnedCalories, exercises, streak,
    loadActivity(), addExercise(), deleteExercise(), updateSteps(n) }
  ```

**✓ Checkpoint 1.2 geçti:** Store action'ları çağrıldığında SQLite'a doğru veri yazılıyor.

---

## Checkpoint 1.3 — Custom Hook'lar

Hook'lar servisleri + store'ları birleştiren React katmanı.

### Görevler

- [ ] `hooks/useMigrosSearch.ts`
  - 500ms debounce — zorunlu
  - Önce `migros_cache` kontrol et
  - `{ results, isLoading, search(query) }` döndür

- [ ] `hooks/useTranslate.ts`
  - `translations` cache önce
  - `{ translate(text): Promise<string> }` döndür

- [ ] `hooks/useNutrition.ts`
  - OpenFoodFacts → USDA fallback zinciri
  - `calorie_cache` kontrolü
  - `{ getNutrition(query), isLoading }` döndür

- [ ] `hooks/usePedometer.ts`
  - `expo-pedometer` ile adım sayısı
  - Health izni yoksa buraya düş
  - `{ steps, isAvailable }` döndür

- [ ] `hooks/useNotifications.ts`
  - İzin isteme, tüm bildirimleri zamanlama/iptal etme
  - `{ scheduleAll(settings), cancelAll(), requestPermission() }` döndür

- [ ] `hooks/useHealthKit.ts`
  - Platform kontrolü → `services/health.ts` çağır
  - İzin reddedilirse `usePedometer` fallback
  - `{ steps, isConnected, requestPermission(), writeCalories() }` döndür

**✓ Checkpoint 1.3 geçti:** Hook'lar bir test bileşeninde çalışıyor, loading/error state'leri doğru.

---

## Faz 1 Tamamlandı

**Kontrol et:**
- [ ] Tüm servis fonksiyonları gerçek veri döndürüyor
- [ ] Store action'ları SQLite'a yazıyor ve in-memory state'i güncelliyor
- [ ] `useMigrosSearch` debounce çalışıyor, ikinci aramada cache'den geliyor
- [ ] `useTranslate` aynı kelimeyi iki kez çevirmek için API çağırmıyor
- [ ] `npx tsc --noEmit` — sıfır hata

**Sonraki faz:** Faz 2 — Onboarding
