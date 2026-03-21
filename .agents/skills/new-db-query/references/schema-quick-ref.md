# Veritabanı Şema Özeti

Bu dosyayı `new-db-query` skill'i kullanırken oku. Tüm tablo isimleri, kolonlar ve ilişkiler burada.

---

## Migration Sırası

```
001_user.ts              → user tablosu (tek satır, id=1)
002_ingredients.ts       → ingredients tablosu
003_recipes.ts           → recipes tablosu
004_recipe_ingredients.ts → junction tablo
005_price_history.ts     → fiyat geçmişi
006_daily_log.ts         → günlük özet (gün başına 1 satır)
007_meals.ts             → öğün kalemleri
008_activity_log.ts      → egzersiz kayıtları
009_streak.ts            → seri takvimi
010_meal_plans.ts        → öğün planları
011_cache.ts             → translations, calorie_cache, migros_cache
```

---

## Tablo → Kolon Özeti

### user (tek satır, id=1)
```
id, name, gender, age, height_cm, weight_kg, body_fat_percent
activity_level, goal
daily_calorie_goal, daily_protein_goal_g, daily_carbs_goal_g, daily_fat_goal_g
daily_budget_goal_tl, daily_step_goal
notif_meal_reminder, notif_calorie_alert, notif_water_reminder
notif_streak_warning, notif_weekly_summary
breakfast_time, lunch_time, dinner_time
water_interval_hours, water_start_time, water_end_time, weekly_summary_day
onboarding_completed, data_retention_days, created_at, updated_at
```

### ingredients
```
id (uuid), name_tr, name_en, source ('user'|'themealdb'|'openfoodfacts')
manually_added (0|1), image_url
calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, nutrition_source
migros_product_name, migros_price_kurus, migros_product_image_url, migros_price_updated_at
created_at, updated_at
```

### recipes
```
id (uuid), name, image_url, serving_count, source ('user'|'themealdb')
themealdb_id, cuisine, category, instructions
total_cost_tl, total_calories, total_protein_g, total_carbs_g, total_fat_g
cost_per_serving_tl, calories_per_serving
is_favorite (0|1), created_at, updated_at
```

### recipe_ingredients
```
id (uuid), recipe_id → recipes(id) CASCADE
ingredient_id → ingredients(id)
amount, unit ('gram'|'ml'|'tablespoon'|'teaspoon'|'cup'|'piece'|'slice'|'handful')
amount_in_grams
price_snapshot_kurus, price_snapshot_date
sort_order
```

### price_history
```
id (uuid), ingredient_id → ingredients(id) CASCADE
price_kurus, recorded_at ('YYYY-MM-DD')
```
**Index:** `(ingredient_id, recorded_at)`

### daily_log (gün başına 1 satır)
```
id (uuid), date TEXT UNIQUE ('YYYY-MM-DD')
total_calories, total_protein_g, total_carbs_g, total_fat_g
total_spending_tl, step_count, burned_calories
created_at
```
**Index:** `date`

### meals
```
id (uuid), log_id → daily_log(id) CASCADE
meal_type ('breakfast'|'lunch'|'dinner'|'snack')
recipe_id → recipes(id) (null ok), ingredient_id → ingredients(id) (null ok)
custom_name
amount, unit, amount_in_grams
calories, protein_g, carbs_g, fat_g, cost_tl
logged_at
```
**Index:** `log_id`

### activity_log
```
id (uuid), log_id → daily_log(id) CASCADE
exercise_type ('running'|'cycling'|'fitness'|'walking'|'swimming'|'football'|'yoga'|'other')
duration_minutes, burned_calories, notes
logged_at
```

### streak
```
id (uuid), date TEXT UNIQUE ('YYYY-MM-DD')
completed (0|1), streak_count
```
**Index:** `date`

### meal_plans
```
id (uuid), title, start_date, end_date
calorie_goal, budget_goal_tl
generated_by ('rule_engine'|'cerebras')
created_at
```

### meal_plan_items
```
id (uuid), plan_id → meal_plans(id) CASCADE
date, meal_type, recipe_id → recipes(id) (null ok)
recipe_name, calories, cost_tl
```

### translations (cache, süresi dolmaz)
```
english (PRIMARY KEY), turkish, created_at
```

### calorie_cache (cache, süresi dolmaz)
```
search_term (PRIMARY KEY)
calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g
source ('openfoodfacts'|'usda'|'manual')
created_at
```

### migros_cache (cache, 24 saat)
```
search_term (PRIMARY KEY)
results_json (JSON array string)
created_at
```

---

## Önemli Kurallar

- Tüm `id` alanları UUID string'i: `generateId()` kullan
- Tüm tarihler `'YYYY-MM-DD'` string formatında
- Tüm fiyatlar kuruş (integer): `Math.round(fiyatTL * 100)`
- CASCADE delete ayarlanmış: `daily_log` silinince `meals` + `activity_log` otomatik silinir
- `daily_log` ve `streak` tablosunda `date` kolonu UNIQUE

---

## Yaygın Query Kalıpları

```typescript
// Bugünün log'unu al veya oluştur
const today = new Date().toISOString().split('T')[0]
let log = await db.getFirstAsync<DailyLog>('SELECT * FROM daily_log WHERE date = ?', [today])
if (!log) {
  const id = generateId()
  await db.runAsync('INSERT INTO daily_log (id, date) VALUES (?, ?)', [id, today])
  log = await db.getFirstAsync<DailyLog>('SELECT * FROM daily_log WHERE date = ?', [today])
}

// Günlük toplamları güncelle (öğün eklenince/silinince)
await db.runAsync(`
  UPDATE daily_log SET
    total_calories = (SELECT COALESCE(SUM(calories), 0) FROM meals WHERE log_id = ?),
    total_spending_tl = (SELECT COALESCE(SUM(cost_tl), 0) FROM meals WHERE log_id = ?)
  WHERE id = ?
`, [logId, logId, logId])

// Son 7 günün log'larını al
const logs = await db.getAllAsync<DailyLog>(
  "SELECT * FROM daily_log WHERE date >= date('now', '-7 days') ORDER BY date DESC"
)
```