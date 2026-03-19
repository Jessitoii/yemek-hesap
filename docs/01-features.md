# 01 — Features

## 1. Recipe Management

### 1.1 Browse Recipes (TheMealDB)
- Search recipes by name
- Browse by category (Breakfast, Lunch, Dinner, Vegan, Protein, etc.)
- Browse by cuisine (Turkish, Italian, Asian, Mexican, etc.)
- Filter by calorie range, cost range, macros
- Sort by lowest calorie, highest calorie, cheapest, most popular
- Infinite scroll with random recipes
- "What should I cook today?" random recipe button with flip animation

### 1.2 Recipe Detail
- Recipe image (from TheMealDB)
- Ingredient list with quantities (translated to Turkish)
- Estimated cost per ingredient (from Migros)
- Estimated total cost + cost per serving
- Total calories + calories per serving
- Macro summary (protein, carbs, fat)
- Cooking instructions
- "Add to My Recipes" button
- "Add to Daily Log" button

### 1.3 Create Custom Recipe
- Enter recipe name
- Search TheMealDB → select a base recipe, OR
- Build from scratch manually
- Add ingredients one by one (search Migros, select product)
- Enter quantity with unit (spoon / cup / gram / piece / slice / handful)
- App converts to grams using density table
- Set serving count
- Add image: camera / gallery / auto-fetch via DDGS
- Save to local database

### 1.4 My Recipes List
- All saved recipes (from TheMealDB or custom)
- Card view: image, name, cost, calories, servings
- Tap to open detail
- Swipe to delete
- Mark as favorite (❤️)

### 1.5 Price History & Update
- Each ingredient stores a price snapshot on save date
- "Update Prices" button fetches current Migros prices
- Price change shown with animation (↑ red / ↓ green)
- Full price history per ingredient visible

### 1.6 Favorites
- Recipes marked as favorite appear in Favorites tab
- Accessible from both Recipes tab and Discover tab

---

## 2. My Ingredients

### 2.1 Ingredients List
- Only manually added ingredients by the user
- Card view: image, name, unit price, calories per 100g
- Accessible from Recipes tab header icon AND Profile tab

### 2.2 Add / Edit Ingredient
- Ingredient name (Turkish)
- Image: camera / gallery / DDGS auto-fetch
- Unit (gram, piece, spoon, cup, etc.)
- Price: search on Migros OR enter manually
- Calories + macros: fetched from OpenFoodFacts/USDA OR entered manually
- Save

---

## 3. Daily Tracking

### 3.1 Daily Summary
- Date picker (defaults to today)
- Calorie ring: consumed / goal (animated, colorful)
- Daily total spending (₺)
- Macro summary bar (protein, carbs, fat)
- Meals list: Breakfast / Lunch / Dinner / Snack
- Each meal shows added items + their calories
- "+" button to add a meal item

### 3.2 Add Meal Item
- Select meal type (Breakfast / Lunch / Dinner / Snack)
- Choose from saved recipes, OR
- Search ingredient directly (Migros + OpenFoodFacts)
- Enter portion / quantity with unit
- Auto-converts to grams
- Adds to daily log

### 3.3 Smart Recipe Suggestion
Logic based on remaining daily calories:

```
remaining calories < 0  → "You've exceeded your daily calorie goal 😔" (no suggestion)
remaining calories < 1000 → suggest recipes under 90% of remaining calories, prioritizing macro gaps
remaining calories ≥ 1000 → suggest 3 random recipes matching macro goals, user picks one
```

Macro gap logic:
- If protein intake is below goal → prioritize high-protein recipes
- If carbs are below goal → prioritize carb-rich recipes
- Shown as a card in the Daily Summary screen

### 3.4 History
- Last 1 year calendar view
- Tap any day to see that day's detail
- Weekly calorie bar chart
- Weekly spending bar chart
- Monthly averages

---

## 4. Discover

### 4.1 Discover Feed
- Search bar (searches TheMealDB)
- Popular Categories (horizontal scroll, emoji icons)
- Recipes by Calorie Range (2×3 grid: 50-100, 100-200, 200-300, 300-400, 400-500, 500-600 kcal)
- From Around the World (horizontal scroll, large cards with real food photos)
- Pick Your Meal (Breakfast / Lunch / Dinner / Snack cards)
- Random Recipes section: "What Should I Cook?" button → random recipe with flip animation

### 4.2 Favorites Tab (inside Discover)
- Recipes the user has hearted
- Grid view
- Empty state: "No favorites yet" + Discover button

### 4.3 Filters & Sorting
Filters:
- Category, Cuisine, Calorie range (slider), Cost range (slider), Macro type (High Protein, Low Carb, Vegan, etc.)

Sorting:
- Lowest calorie, Highest calorie, Cheapest, Most expensive, Most popular

### 4.4 Meal Plan
- Enter calorie goal + budget
- Select plan duration (1 / 3 / 7 days)
- Generate plan (rule engine first, Cerebras API as fallback)
- Visual daily meal suggestions with recipe images
- "Apply This Plan" → adds meals to daily log

---

## 5. Activity

### 5.1 Activity Summary
- Today's burned calories (total)
- Pedometer (step count + step goal progress ring)
- Exercise list for today
- "+" button to add exercise
- Streak calendar

### 5.2 Add Exercise
- Select exercise type (running, cycling, fitness, walking, swimming, etc.)
- Enter duration (minutes)
- Auto-calculates burned calories based on user profile (weight, height, age)
- Save to activity log

### 5.3 Pedometer
- Uses expo-pedometer (reads from Health app if connected)
- Step goal configurable from Profile
- Progress ring on Activity screen
- Daily steps saved to SQLite

### 5.4 Streak Calendar (Don't Break the Chain)
- Monthly calendar view
- Days with completed goal highlighted in green
- Current streak count shown prominently
- Motivational message from avatar
- Yearly streak data stored in SQLite

### 5.5 Calorie Burn Calculation
Uses Mifflin-St Jeor formula:

```
BMR (Male)   = (10 × weight) + (6.25 × height) - (5 × age) + 5
BMR (Female) = (10 × weight) + (6.25 × height) - (5 × age) - 161

TDEE = BMR × activity multiplier
  Sedentary       → × 1.2
  Lightly active  → × 1.375
  Moderately active → × 1.55
  Very active     → × 1.725
```

If profile is incomplete when opening Activity tab → redirect to Profile to fill in missing data.

---

## 6. Profile

### 6.1 Personal Info
- Name, gender, age, height (cm), weight (kg)
- Body fat percentage (optional)
- "Calculate" link → opens Body Fat Modal

### 6.2 Body Fat Modal
Uses U.S. Navy formula:
```
Male:   % = 495 / (1.0324 - 0.19077 × log10(waist - neck) + 0.15456 × log10(height)) - 450
Female: % = 495 / (1.29579 - 0.35004 × log10(waist + hip - neck) + 0.22100 × log10(height)) - 450
```
- Inputs: waist, neck (+ hip for female) in cm
- Shows result + category (Fit / Normal / High / etc.)
- "Save to Profile" button

### 6.3 Goals & Targets
- Select goal: Lose weight / Gain weight / Stay fit / Eat healthy / Reduce spending
- Activity level selection
- Auto-calculated daily targets:

| Goal | Calories | Macros |
|---|---|---|
| Lose weight | TDEE − 500 kcal | Protein 30% / Carbs 40% / Fat 30% |
| Gain weight | TDEE + 500 kcal | Protein 30% / Carbs 50% / Fat 20% |
| Stay fit | TDEE | Protein 25% / Carbs 50% / Fat 25% |
| Eat healthy | TDEE | Protein 25% / Carbs 45% / Fat 30% |
| Reduce spending | No calorie goal | Budget goal only |

- Manual override option: "Use suggested values" OR "Enter manually"
- Daily budget goal (₺)

### 6.4 Settings
- Notification preferences (meal reminders, calorie alerts, streak alerts, weekly summary)
- Meal reminder times (breakfast, lunch, dinner)
- Water reminder interval + active hours
- Weekly summary day
- Step goal
- Default serving size

### 6.5 Statistics
- Total spending this month
- Average daily calories this month
- Most cooked recipe
- Total calories burned
- Longest streak

### 6.6 My Ingredients (also accessible from here)
- Same screen as in Recipes tab

### 6.7 Health App Integration
- Connect to Apple HealthKit (iOS) or Google Health Connect (Android)
- Read: step count, weight, burned calories
- Write: calories consumed, macros, water intake, exercise
- If user denies permission → fallback to manual/pedometer

---

## 7. Onboarding
*See [08-onboarding.md](./08-onboarding.md) for full flow.*

7-slide onboarding on first launch:
1. Welcome + name input
2. Feature intro — cost tracking
3. Feature intro — calorie tracking
4. Goal selection (multi-select)
5. Profile info (gender, age, height, weight)
6. Activity level
7. Ready screen with calculated daily targets

---

## 8. Notifications
*See [07-notifications.md](./07-notifications.md) for full plan.*

- Meal reminders (configurable times)
- Daily calorie goal alerts (reached / exceeded)
- Water reminders (configurable interval)
- Streak warning (goal not completed today)
- Weekly summary

---

## 9. Unit Conversion

### Supported Units
| Unit | Turkish |
|---|---|
| gram | gram |
| ml | ml |
| teaspoon (çay kaşığı) | çay kaşığı |
| tablespoon (yemek kaşığı) | yemek kaşığı |
| cup (bardak) | bardak |
| piece (adet) | adet |
| slice (dilim) | dilim |
| handful (avuç) | avuç |

### Density Table
150–200 common ingredients with gram equivalents per unit stored in `utils/densityTable.ts`. Fully offline, no API needed.

If ingredient not found in table → prompt user to enter grams manually → cache the value.

---

## 10. Caching Strategy

| Data | Storage | Expiry |
|---|---|---|
| Translations | SQLite (`translations` table) | Never (translations don't change) |
| Calorie/macro data | SQLite (`calorie_cache` table) | Never |
| Migros search results | SQLite (`migros_cache` table) | 24 hours |
| Daily logs | SQLite (`daily_log` table) | 1 year (configurable) |
| Streak data | SQLite (`streak` table) | Never |
| Selected product prices | SQLite (`ingredients` table) | Until user updates |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Migros endpoint down / changed | Show "Price unavailable, enter manually" warning. App continues to work for calorie tracking. |
| Migros rate limiting | Debounce search input (500ms) + cache search results for session |
| TheMealDB returns no results | Redirect user to "Create recipe manually" flow |
| TheMealDB measure unparseable ("to taste", "some") | Show ingredient to user, ask for manual gram input |
| MyMemory daily limit reached | Serve all translations from cache. If not cached, show English name with warning. |
| MyMemory wrong translation | If Migros search returns no results, show "Search manually" button for user to type their own query |
| OpenFoodFacts product not found | Try USDA FoodData Central. If still not found, ask user for manual input and cache it. |
| Incorrect calorie data | Display disclaimer: "Values are estimates. Check product label for accurate information." |
| Profile incomplete (Activity tab) | Redirect to Profile with highlighted missing fields |
| Calorie goal exceeded (suggestion) | Show motivational message from avatar, no recipe suggestion |
| Health app permission denied | Fallback to expo-pedometer for steps, manual entry for weight |
| Device doesn't support pedometer | Show "This feature is not supported on your device" message |
| DDGS image fetch fails | Fall back to Unsplash search, then to a default placeholder image |

---

> **Note:** All calorie and cost calculations are based on the core ingredients and measures of each recipe. Values are approximate.
