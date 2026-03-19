# 02 — Architecture

## Core Principle

**Fully client-side. Zero backend. Zero cost.**

All data is stored locally on the user's device using SQLite. External APIs are used only to fetch data — nothing is written to any external server. No authentication, no cloud sync, no recurring infrastructure costs.

---

## Tech Stack

### Core
| Technology | Version | Purpose |
|---|---|---|
| Expo | Latest | React Native framework + build tooling |
| React Native | Latest | Cross-platform mobile UI |
| expo-router | v3+ | File-based navigation |
| TypeScript | Latest | Type safety |

### State Management
| Technology | Purpose |
|---|---|
| Zustand | Global app state (recipes, daily log, user profile, activity) |

### Database
| Technology | Purpose |
|---|---|
| expo-sqlite | Local SQLite database for all persistent data |

### Native Integrations
| Technology | Purpose |
|---|---|
| expo-pedometer | Step counting |
| expo-notifications | Local push notifications |
| expo-image-picker | Camera + gallery access |
| expo-camera | Camera access |
| react-native-health | Apple HealthKit (iOS) |
| react-native-health-connect | Google Health Connect (Android) |

### UI & Animation
| Technology | Purpose |
|---|---|
| react-native-reanimated | Smooth animations (onboarding, price change, streak) |
| react-native-svg | Progress rings, charts |
| victory-native | Charts (weekly calorie, spending graphs) |
| lottie-react-native | Avatar animations |

### Build
| Technology | Purpose |
|---|---|
| EAS Build | Required for native modules (HealthKit, Health Connect) |
| expo-dev-client | Custom dev client for local development with native modules |

---

## Data Sources

### 1. Migros API (Unofficial)
```
Endpoint: https://www.migros.com.tr/rest/search/screens/products?q={query}
Method:   GET
Auth:     None required
Returns:  Product list with name, price (in kuruş), images, brand, category
```
- `shownPrice` field = actual displayed price in kuruş → divide by 100 for TL
- No official documentation, no rate limit observed
- Debounce all search calls (500ms)
- Cache search results in SQLite for 24 hours

### 2. TheMealDB
```
Endpoint: https://www.themealdb.com/api/json/v1/1/search.php?s={query}
Endpoint: https://www.themealdb.com/api/json/v1/1/random.php
Endpoint: https://www.themealdb.com/api/json/v1/1/filter.php?c={category}
Method:   GET
Auth:     None required
Returns:  Recipe with name, image, ingredients (up to 20), measures, instructions
```
- Ingredient names are in English → translate via MyMemory
- Measures are in non-standard units (cups, tbsp) → convert via density table
- Cache fetched recipes in SQLite

### 3. OpenFoodFacts
```
Endpoint: https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=1
Method:   GET
Auth:     None required
Returns:  Product with calories, protein, carbs, fat per 100g
```
- Turkish products available but coverage is incomplete
- Fallback to USDA if not found

### 4. USDA FoodData Central
```
Endpoint: https://api.nal.usda.gov/fdc/v1/foods/search?query={query}&api_key=DEMO_KEY
Method:   GET
Auth:     Free API key (DEMO_KEY works for low usage)
Returns:  Food with full macro breakdown per 100g
```
- Used as fallback when OpenFoodFacts has no data
- DEMO_KEY allows 30 requests/hour, 50/day — sufficient for a fallback

### 5. MyMemory Translation
```
Endpoint: https://api.mymemory.translated.net/get?q={text}&langpair=en|tr
Method:   GET
Auth:     None required (1000 req/day free)
Returns:  Translated text
```
- Used to translate TheMealDB ingredient names from English to Turkish
- All translations cached in SQLite permanently — API call only on first encounter
- If limit reached: serve from cache, show English name with warning if not cached

### 6. Unsplash
```
Endpoint: https://api.unsplash.com/search/photos?query={query}&client_id={key}
Method:   GET
Auth:     Free API key (50 requests/hour)
Returns:  List of food photos with URLs
```
- Used for recipe images when user creates custom recipes
- Fallback when TheMealDB has no image

### 7. DDGS (DuckDuckGo Image Search)
```
Uses DuckDuckGo's internal image search endpoint
Unofficial — may break without notice
```
- Secondary fallback for ingredient and custom recipe images
- If DDGS fails → use Unsplash → if both fail → use placeholder image

### 8. Cerebras API
```
Model:    qwen-3-235b-a22b-instruct-2507
Usage:    Meal plan generation (fallback only)
Cost:     Free tier available
```
- Only called when generating weekly meal plans
- Primary: rule engine (no API call)
- Fallback: Cerebras if rule engine result is poor quality
- Prompt returns structured JSON with daily meal suggestions

---

## Application Flow

### App Launch Flow
```
App opens
    ↓
Check SQLite: onboarding_completed?
    ↓ No                    ↓ Yes
Onboarding flow         Check today's daily_log exists?
                            ↓ No            ↓ Yes
                        Create log      Load main tabs
                            ↓
                        Load main tabs
```

### Recipe Cost Calculation Flow
```
User selects or creates a recipe
    ↓
For each ingredient:
  1. Translate name (EN → TR) via MyMemory (cached)
  2. Search Migros API with Turkish name
  3. Show results to user → user selects product
  4. Convert quantity to grams via density table
  5. Calculate cost: (shownPrice / 100) × (grams / product_grams)
  6. Fetch calories from OpenFoodFacts → USDA fallback
  7. Calculate calories: (kcal_per_100g / 100) × grams
    ↓
Sum all ingredients:
  total_cost    = Σ ingredient costs
  total_calories = Σ ingredient calories
  total_protein  = Σ ingredient protein
  total_carbs    = Σ ingredient carbs
  total_fat      = Σ ingredient fat
    ↓
Save to SQLite
```

### Daily Calorie & Spending Tracking Flow
```
User adds a meal item
    ↓
Select recipe or ingredient
Enter portion + unit
    ↓
Convert to grams (density table)
    ↓
Calculate:
  calories = (kcal_per_100g / 100) × grams
  cost     = (price_per_100g / 100) × grams
    ↓
Insert into meals table
Update daily_log totals
    ↓
Check: calories vs goal
  → Near goal? Trigger notification
  → Exceeded? Show warning + hide recipe suggestion
```

### Smart Recipe Suggestion Flow
```
Load daily summary screen
    ↓
remaining = daily_calorie_goal - calories_consumed_today
    ↓
remaining < 0     → Show "Goal exceeded" message. No suggestion.
remaining < 1000  → Filter recipes where total_calories < remaining × 0.9
                    Rank by macro gap (protein/carb/fat deficit)
                    Show top 1 suggestion
remaining ≥ 1000  → Filter recipes matching macro goals
                    Show 3 random suggestions, user picks one
```

### Translation + Migros Search Flow
```
TheMealDB ingredient: "spring onion"
    ↓
Check SQLite translations table
    ↓ Found             ↓ Not found
"taze soğan"        Call MyMemory API
    ↓                   ↓
Search Migros       Cache result in SQLite
with Turkish name       ↓
    ↓               Search Migros with Turkish name
Show results            ↓
                    Show results
                        ↓
                    If no results → show "Search manually" button
```

---

## Zustand Stores

### `stores/user.ts`
```typescript
{
  profile: UserProfile        // name, age, height, weight, etc.
  goals: UserGoals            // calorie goal, macro goals, budget goal
  settings: AppSettings       // notification prefs, reminder times, etc.
  onboardingCompleted: boolean
}
```

### `stores/recipes.ts`
```typescript
{
  recipes: Recipe[]           // all saved recipes
  ingredients: Ingredient[]   // user's custom ingredients
  favorites: string[]         // recipe IDs
}
```

### `stores/dailyLog.ts`
```typescript
{
  selectedDate: string        // currently viewed date
  todayLog: DailyLog          // today's meals, totals
  suggestion: Recipe | null   // smart recipe suggestion
}
```

### `stores/activity.ts`
```typescript
{
  todaySteps: number
  todayBurnedCalories: number
  exercises: Exercise[]
  streak: number
}
```

---

## SQLite Architecture

All database operations go through `db/queries/` — no raw SQL in components or stores.

```
Components / Screens
        ↓
    Zustand Stores
        ↓
    db/queries/*.ts      ← typed query functions
        ↓
    db/index.ts          ← SQLite connection + migrations
        ↓
    expo-sqlite
```

Migrations run automatically on app launch. Each migration is versioned and runs only once.

---

## Health Integration Architecture

```
Activity Screen
    ↓
healthkit.ts (services layer)
    ↓
Platform check:
  iOS     → react-native-health (HealthKit)
  Android → react-native-health-connect
    ↓
Permission request on first use
    ↓
  Granted → read steps, weight, burned calories
            write calories consumed, macros, water, exercise
  Denied  → expo-pedometer for steps
            manual entry for weight
            no data written to health app
```

---

## Offline Behavior

The app is designed to work fully offline after initial data is cached:

| Feature | Offline Behavior |
|---|---|
| Saved recipes | ✅ Fully available |
| Daily log | ✅ Fully available |
| Calorie/macro data | ✅ Available if previously cached |
| Translations | ✅ Available if previously cached |
| Migros prices | ❌ Cannot fetch — show last known price |
| TheMealDB recipes | ❌ Cannot fetch new — show cached only |
| Recipe suggestions | ✅ Works from cached recipes |
| Exercise logging | ✅ Fully available |
| Notifications | ✅ Fully available (local) |

---

## Performance Considerations

- **Debounce** all Migros search inputs (500ms) to avoid excessive API calls
- **Cache** Migros search results for 24 hours in SQLite
- **Cache** translations permanently — same ingredient never translated twice
- **Paginate** recipe lists — load 20 at a time
- **Lazy load** images — use placeholder until image URL resolves
- **Clean up** daily logs older than 1 year (configurable)
- **Limit** migros_cache to last 200 search terms

---

## Security Considerations

- No user data sent to any server
- No authentication tokens stored
- API keys (Unsplash, USDA) are low-sensitivity free-tier keys — store in `.env`
- Migros API called directly from client — no proxy needed at current scale
- Health data stays on device — never transmitted

---

## Build Requirements

Standard Expo managed workflow is **not sufficient** due to native health modules.

**Required: EAS Build + expo-dev-client**

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for development
eas build --profile development --platform android
eas build --profile development --platform ios

# Build for production
eas build --profile production --platform all
```
