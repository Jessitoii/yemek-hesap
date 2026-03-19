# 04 — Database

## Overview

KaloriTabak uses **expo-sqlite** for all persistent storage. No backend, no cloud — everything lives on the user's device.

All database operations go through typed query functions in `db/queries/`. No raw SQL in components or Zustand stores.

---

## Migration System

Migrations run automatically on app launch via `db/index.ts`. Each migration runs only once and is versioned.

```
db/
├── index.ts              ← opens DB connection, runs pending migrations
└── migrations/
    ├── 001_user.ts
    ├── 002_ingredients.ts
    ├── 003_recipes.ts
    ├── 004_recipe_ingredients.ts
    ├── 005_price_history.ts
    ├── 006_daily_log.ts
    ├── 007_meals.ts
    ├── 008_activity_log.ts
    ├── 009_streak.ts
    ├── 010_meal_plans.ts
    └── 011_cache.ts
```

---

## Tables

### 001 — user
Stores user profile, goals, and app settings. Single row (id = 1).

```sql
CREATE TABLE IF NOT EXISTS user (
  id                        INTEGER PRIMARY KEY DEFAULT 1,

  -- personal info
  name                      TEXT NOT NULL,
  gender                    TEXT,                         -- 'male' | 'female'
  age                       INTEGER,
  height_cm                 REAL,
  weight_kg                 REAL,
  body_fat_percent          REAL,                         -- optional

  -- activity & goal
  activity_level            TEXT,                         -- 'sedentary' | 'light' | 'moderate' | 'very_active'
  goal                      TEXT,                         -- 'lose_weight' | 'gain_weight' | 'stay_fit' | 'eat_healthy' | 'reduce_spending'

  -- calculated targets (auto-updated when profile or goal changes)
  daily_calorie_goal        INTEGER,
  daily_protein_goal_g      REAL,
  daily_carbs_goal_g        REAL,
  daily_fat_goal_g          REAL,
  daily_budget_goal_tl      REAL,
  daily_step_goal           INTEGER DEFAULT 10000,

  -- notification settings
  notif_meal_reminder       INTEGER DEFAULT 1,            -- 0 | 1
  notif_calorie_alert       INTEGER DEFAULT 1,
  notif_water_reminder      INTEGER DEFAULT 1,
  notif_streak_warning      INTEGER DEFAULT 1,
  notif_weekly_summary      INTEGER DEFAULT 1,

  -- notification times
  breakfast_time            TEXT DEFAULT '08:00',
  lunch_time                TEXT DEFAULT '12:30',
  dinner_time               TEXT DEFAULT '19:00',
  water_interval_hours      INTEGER DEFAULT 2,
  water_start_time          TEXT DEFAULT '08:00',
  water_end_time            TEXT DEFAULT '22:00',
  weekly_summary_day        TEXT DEFAULT 'sunday',

  -- app state
  onboarding_completed      INTEGER DEFAULT 0,
  data_retention_days       INTEGER DEFAULT 365,
  created_at                TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at                TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### 002 — ingredients
All ingredients — both from TheMealDB (via recipes) and manually added by the user.

```sql
CREATE TABLE IF NOT EXISTS ingredients (
  id                        TEXT PRIMARY KEY,             -- uuid

  name_tr                   TEXT NOT NULL,
  name_en                   TEXT,

  source                    TEXT NOT NULL,                -- 'user' | 'themealdb' | 'openfoodfacts'
  manually_added            INTEGER DEFAULT 0,            -- 1 = user's own ingredient

  image_url                 TEXT,

  -- nutrition per 100g
  calories_per_100g         REAL,
  protein_per_100g          REAL,
  carbs_per_100g            REAL,
  fat_per_100g              REAL,
  nutrition_source          TEXT,                         -- 'openfoodfacts' | 'usda' | 'manual'

  -- migros product
  migros_product_name       TEXT,
  migros_price_kurus        INTEGER,
  migros_product_image_url  TEXT,
  migros_price_updated_at   TEXT,

  created_at                TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at                TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### 003 — recipes
All saved recipes — from TheMealDB or created manually by the user.

```sql
CREATE TABLE IF NOT EXISTS recipes (
  id                        TEXT PRIMARY KEY,             -- uuid

  name                      TEXT NOT NULL,
  image_url                 TEXT,
  serving_count             INTEGER DEFAULT 1,
  source                    TEXT NOT NULL,                -- 'user' | 'themealdb'
  themealdb_id              TEXT,
  cuisine                   TEXT,
  category                  TEXT,
  instructions              TEXT,

  -- calculated totals
  total_cost_tl             REAL,
  total_calories            REAL,
  total_protein_g           REAL,
  total_carbs_g             REAL,
  total_fat_g               REAL,
  cost_per_serving_tl       REAL,
  calories_per_serving      REAL,

  is_favorite               INTEGER DEFAULT 0,

  created_at                TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at                TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### 004 — recipe_ingredients
Junction table linking recipes to their ingredients with quantities.

```sql
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id                        TEXT PRIMARY KEY,             -- uuid
  recipe_id                 TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id             TEXT NOT NULL REFERENCES ingredients(id),

  amount                    REAL NOT NULL,
  unit                      TEXT NOT NULL,                -- 'gram' | 'ml' | 'tablespoon' | 'teaspoon' | 'cup' | 'piece' | 'slice' | 'handful'
  amount_in_grams           REAL,

  -- price snapshot at time of saving
  price_snapshot_kurus      INTEGER,
  price_snapshot_date       TEXT,

  sort_order                INTEGER DEFAULT 0
);
```

---

### 005 — price_history
Tracks price changes for ingredients over time.

```sql
CREATE TABLE IF NOT EXISTS price_history (
  id                        TEXT PRIMARY KEY,             -- uuid
  ingredient_id             TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  price_kurus               INTEGER NOT NULL,
  recorded_at               TEXT NOT NULL                 -- 'YYYY-MM-DD'
);

CREATE INDEX IF NOT EXISTS idx_price_history_ingredient
  ON price_history(ingredient_id, recorded_at);
```

---

### 006 — daily_log
One row per day. Running totals updated whenever a meal or exercise is added/removed.

```sql
CREATE TABLE IF NOT EXISTS daily_log (
  id                        TEXT PRIMARY KEY,             -- uuid
  date                      TEXT NOT NULL UNIQUE,         -- 'YYYY-MM-DD'

  total_calories            REAL DEFAULT 0,
  total_protein_g           REAL DEFAULT 0,
  total_carbs_g             REAL DEFAULT 0,
  total_fat_g               REAL DEFAULT 0,
  total_spending_tl         REAL DEFAULT 0,

  step_count                INTEGER DEFAULT 0,
  burned_calories           REAL DEFAULT 0,

  created_at                TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_log_date ON daily_log(date);
```

---

### 007 — meals
Individual meal items logged per day.

```sql
CREATE TABLE IF NOT EXISTS meals (
  id                        TEXT PRIMARY KEY,             -- uuid
  log_id                    TEXT NOT NULL REFERENCES daily_log(id) ON DELETE CASCADE,

  meal_type                 TEXT NOT NULL,                -- 'breakfast' | 'lunch' | 'dinner' | 'snack'

  recipe_id                 TEXT REFERENCES recipes(id),
  ingredient_id             TEXT REFERENCES ingredients(id),
  custom_name               TEXT,

  amount                    REAL NOT NULL,
  unit                      TEXT NOT NULL,
  amount_in_grams           REAL,

  -- snapshot values at time of logging
  calories                  REAL,
  protein_g                 REAL,
  carbs_g                   REAL,
  fat_g                     REAL,
  cost_tl                   REAL,

  logged_at                 TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meals_log_id ON meals(log_id);
```

---

### 008 — activity_log
Exercise entries per day.

```sql
CREATE TABLE IF NOT EXISTS activity_log (
  id                        TEXT PRIMARY KEY,             -- uuid
  log_id                    TEXT NOT NULL REFERENCES daily_log(id) ON DELETE CASCADE,

  exercise_type             TEXT NOT NULL,                -- 'running' | 'cycling' | 'fitness' | 'walking' | 'swimming' | 'football' | 'yoga' | 'other'
  duration_minutes          INTEGER NOT NULL,
  burned_calories           REAL NOT NULL,
  notes                     TEXT,

  logged_at                 TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### 009 — streak
One row per day to track habit completion.

```sql
CREATE TABLE IF NOT EXISTS streak (
  id                        TEXT PRIMARY KEY,             -- uuid
  date                      TEXT NOT NULL UNIQUE,         -- 'YYYY-MM-DD'
  completed                 INTEGER DEFAULT 0,            -- 0 | 1
  streak_count              INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_streak_date ON streak(date);
```

---

### 010 — meal_plans
AI or rule-engine generated meal plans.

```sql
CREATE TABLE IF NOT EXISTS meal_plans (
  id                        TEXT PRIMARY KEY,             -- uuid
  title                     TEXT,
  start_date                TEXT,
  end_date                  TEXT,
  calorie_goal              INTEGER,
  budget_goal_tl            REAL,
  generated_by              TEXT,                         -- 'rule_engine' | 'cerebras'
  created_at                TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meal_plan_items (
  id                        TEXT PRIMARY KEY,             -- uuid
  plan_id                   TEXT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  date                      TEXT NOT NULL,
  meal_type                 TEXT NOT NULL,
  recipe_id                 TEXT REFERENCES recipes(id),
  recipe_name               TEXT,
  calories                  REAL,
  cost_tl                   REAL
);
```

---

### 011 — cache tables

```sql
-- Translation cache (never expires)
CREATE TABLE IF NOT EXISTS translations (
  english                   TEXT PRIMARY KEY,
  turkish                   TEXT NOT NULL,
  created_at                TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Calorie/macro cache (never expires)
CREATE TABLE IF NOT EXISTS calorie_cache (
  search_term               TEXT PRIMARY KEY,
  calories_per_100g         REAL,
  protein_per_100g          REAL,
  carbs_per_100g            REAL,
  fat_per_100g              REAL,
  source                    TEXT,                         -- 'openfoodfacts' | 'usda' | 'manual'
  created_at                TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Migros search cache (expires after 24 hours)
CREATE TABLE IF NOT EXISTS migros_cache (
  search_term               TEXT PRIMARY KEY,
  results_json              TEXT NOT NULL,                -- JSON array of Migros products
  created_at                TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## Relationships Diagram

```
user (1 row)
│
└── daily_log (1 per day)
      ├── meals (many)
      │     ├── → recipes
      │     └── → ingredients
      └── activity_log (many)

recipes (many)
└── recipe_ingredients (many)
      └── → ingredients
            └── price_history (many)

streak (1 per day)

meal_plans (many)
└── meal_plan_items (many)
      └── → recipes

--- cache tables (standalone) ---
translations
calorie_cache
migros_cache
```

---

## Query Layer

```
db/queries/
├── user.ts           → getUser(), updateUser(), updateGoals()
├── recipes.ts        → getRecipes(), getRecipeById(), saveRecipe(), deleteRecipe(), toggleFavorite()
├── ingredients.ts    → getIngredients(), saveIngredient(), deleteIngredient()
├── dailyLog.ts       → getLogByDate(), createLog(), updateLogTotals()
├── meals.ts          → getMealsByDate(), addMeal(), deleteMeal()
├── activity.ts       → getActivityByDate(), addExercise(), updateSteps()
├── streak.ts         → getStreak(), markDayComplete(), getCurrentStreak()
├── mealPlans.ts      → savePlan(), getPlans(), deletePlan()
└── cache.ts          → getTranslation(), setTranslation()
                        getCalorieCache(), setCalorieCache()
                        getMigrosCache(), setMigrosCache()
                        cleanExpiredMigrosCache()
```

---

## Cleanup Policy

Runs in background on app launch, after UI loads:

```sql
-- Delete daily logs older than retention period (default 365 days)
DELETE FROM daily_log WHERE date < date('now', '-365 days');

-- Delete expired Migros cache (older than 24 hours)
DELETE FROM migros_cache WHERE created_at < datetime('now', '-1 day');

-- Cascade deletes handle meals and activity_log automatically
```
