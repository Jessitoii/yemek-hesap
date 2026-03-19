# 03 — Screens

## Navigation Structure

```
App
├── (onboarding)/          ← shown only on first launch
│   ├── Slide 1: Welcome
│   ├── Slide 2: Cost Intro
│   ├── Slide 3: Calorie Intro
│   ├── Slide 4: Goal Selection
│   ├── Slide 5: Profile Info
│   ├── Slide 6: Activity Level
│   └── Slide 7: Ready
│
└── (tabs)/                ← main app after onboarding
    ├── Recipes
    │   ├── Recipe List
    │   ├── Recipe Detail
    │   ├── New Recipe
    │   ├── Ingredient Matching (flow screen)
    │   └── My Ingredients
    │       └── Add / Edit Ingredient
    ├── Daily Log
    │   ├── Daily Summary
    │   ├── Add Meal Item
    │   └── History
    ├── Discover
    │   ├── Discover Feed
    │   └── Discover Recipe Detail
    │       └── Meal Plan
    ├── Activity
    │   ├── Activity Summary
    │   ├── Add Exercise
    │   └── Streak Calendar
    └── Profile
        ├── Profile Main
        │   └── Body Fat Modal
        └── My Ingredients (same screen as in Recipes tab)
```

---

## Onboarding Screens

### Slide 1 — Welcome
- Full-screen illustration with app avatar
- Animated logo + "KaloriTabak" title fades in
- "What's your name?" text input
- Next button (disabled until name entered)

### Slide 2 — Cost Intro
- Avatar character with shopping basket animation
- Headline: "Do you know how much your meals actually cost?"
- Subtext: "Real-time cost calculation using live Migros prices."
- Progress dots (1/7)
- Next button

### Slide 3 — Calorie Intro
- Avatar character with plate animation
- Headline: "[Name], we make healthy eating easy."
- Subtext: "Automatic calorie and macro tracking — you just eat."
- Progress dots (2/7)
- Next button

### Slide 4 — Goal Selection
- Headline: "What brings you here?"
- Multi-select options (styled chips):
  - 🏋️ I want to lose weight
  - 💪 I want to gain weight
  - 🎯 I want to stay fit
  - 🥗 I want to eat healthier
  - 💰 I want to reduce food spending
- User can select multiple
- Progress dots (3/7)
- Next button

### Slide 5 — Profile Info
- Headline: "Let's set your personal calorie goal."
- Fields:
  - Gender (Male / Female toggle)
  - Age (number input)
  - Height in cm (number input)
  - Weight in kg (number input)
- Small note: "This data is stored only on your device."
- Progress dots (4/7)
- Next button

### Slide 6 — Activity Level
- Headline: "How active are you daily?"
- Single-select options with icons:
  - 🛋️ Sedentary — desk job, little movement
  - 🚶 Lightly active — exercise 1-3 days/week
  - 🏃 Moderately active — exercise 3-5 days/week
  - 💪 Very active — intense training every day
- Progress dots (5/7)
- Next button

### Slide 7 — Ready
- Avatar doing a celebration animation
- Headline: "You're in the right place, [Name]! 🎉"
- Shows calculated targets based on goal + profile:
  ```
  Your Goal: Lose Weight
  Daily Calories: 1,650 kcal
  Protein: 124g  |  Carbs: 165g  |  Fat: 55g
  ```
- "Let's get started!" button → navigates to main tabs
- Progress dots (6/7 → complete)

---

## Tab 1 — Recipes

### Screen 1.1 — Recipe List
**Header:**
- Title: "Recipes"
- Right icons: 🥕 (My Ingredients) | 🔍 (Search) | ⊕ (New Recipe)

**Body:**
- If empty: avatar illustration + "No recipes yet. Start by discovering or creating one!" + two CTA buttons
- Recipe cards (vertical list):
  - Recipe image (rounded corners)
  - Recipe name
  - Cost per serving (₺X.XX / serving)
  - Calories per serving (X kcal / serving)
  - Serving count
  - ❤️ favorite icon
  - Swipe left → delete

### Screen 1.2 — Recipe Detail
**Header:**
- Back button
- Share icon
- Edit icon

**Body:**
- Full-width recipe image
- Recipe name (large)
- Tags: source (TheMealDB / Custom), cuisine
- Stats row: total cost | total calories | servings
- Macro bar: protein / carbs / fat (colored, animated)
- Section: Ingredients
  - Each row: Migros product image | ingredient name | quantity | cost | calories
  - Tap ingredient → see Migros product detail
- Price History button → expands inline table showing date / price / change (↑↓ animated)
- "Update Prices" button → fetches current Migros prices, animates changes
- Section: Instructions (collapsible)
- Bottom bar: "Add to Daily Log" button (primary) | "Edit" button (secondary)

### Screen 1.3 — New Recipe
**Header:**
- Back button
- Title: "New Recipe"
- Save button (top right, disabled until valid)

**Body:**
- Recipe name input
- Image picker: Camera | Gallery | Auto-fetch (DDGS/Unsplash)
- Search TheMealDB section:
  - Search input
  - Results list → tap to auto-fill ingredients
- OR "Build from scratch" toggle
- Serving count input
- Ingredients list (starts empty):
  - Each added ingredient shows: image | name | quantity | unit | grams | cost | calories
  - "+ Add Ingredient" button → opens Ingredient Matching screen

### Screen 1.4 — Ingredient Matching (Flow Screen)
**Triggered when:** adding an ingredient to a recipe

**Header:**
- Back button
- Title: Ingredient name (e.g. "Süt")

**Body:**
- Search bar (pre-filled with translated ingredient name)
- Migros product list:
  - Product image
  - Product name
  - Price (₺XX.XX)
  - Unit price if available (₺XX.XX / Litre)
  - "Select" button
- "Search manually" button (if auto-search fails)

**After product selected:**
- Quantity input
- Unit selector dropdown: gram | ml | tablespoon | teaspoon | cup | piece | slice | handful
- Live preview: "X [unit] ≈ Y grams"
- Calorie preview: "≈ Z kcal"
- Cost preview: "≈ ₺X.XX"
- "Confirm" button → returns to New Recipe screen

### Screen 1.5 — My Ingredients
**Header:**
- Title: "My Ingredients"
- "+" button (top right)

**Body:**
- If empty: avatar + "You haven't added any custom ingredients yet."
- Ingredient cards (grid, 2 columns):
  - Ingredient image
  - Name
  - Price per 100g
  - Calories per 100g
  - Tap → Edit | Long press → Delete

### Screen 1.6 — Add / Edit Ingredient
**Header:**
- Back button
- Title: "New Ingredient" or "Edit Ingredient"
- Save button

**Body:**
- Image picker: Camera | Gallery | Auto-fetch
- Ingredient name input (Turkish)
- Unit selector
- Migros price section:
  - Search on Migros button → opens product search
  - OR "Enter manually" toggle → price input
- Nutrition section:
  - Auto-fetch from OpenFoodFacts/USDA button
  - OR manual inputs: calories, protein, carbs, fat (per 100g)
- Save button

---

## Tab 2 — Daily Log

### Screen 2.1 — Daily Summary
**Header:**
- Date picker (← today →)
- Title: date (e.g. "Wednesday, March 18")

**Body:**
- Calorie Ring (large, centered):
  - Consumed / Goal (animated fill)
  - Net calories in center
  - Color: green (under goal) → orange (near goal) → red (over goal)
- Stats row: 🔥 calories | 💰 spending | 👟 steps | 🏃 burned
- Macro bars (protein / carbs / fat):
  - Colorful animated progress bars
  - Consumed g / Goal g shown
- Smart Recipe Suggestion card:
  - Recipe image + name + calories + cost
  - "Add to log" button
  - Hidden if goal exceeded → motivational message from avatar instead
- Meals sections (Breakfast / Lunch / Dinner / Snack):
  - Each section header shows subtotal calories
  - Each item: image | name | quantity | calories | cost
  - Swipe to delete
  - "+" button per section

### Screen 2.2 — Add Meal Item
**Header:**
- Back button
- Title: "Add to [Meal Type]"

**Body:**
- Meal type selector (Breakfast / Lunch / Dinner / Snack)
- Two tabs: "My Recipes" | "Search Food"
- My Recipes tab:
  - List of saved recipes
  - Tap → select serving count → add
- Search Food tab:
  - Search input
  - Results from Migros + OpenFoodFacts combined
  - Tap → enter quantity + unit → add
- Quantity input with unit selector
- Live calorie + cost preview
- "Add" button

### Screen 2.3 — History
**Header:**
- Title: "History"
- Month/Year selector

**Body:**
- Calendar view (monthly):
  - Each day shows a small calorie indicator dot
  - Green = under goal | Orange = near goal | Red = over goal | Grey = no data
  - Tap any day → shows that day's summary inline below calendar
- Weekly Charts section:
  - Bar chart: calories per day (last 7 days)
  - Bar chart: spending per day (last 7 days)
- Monthly Summary:
  - Average daily calories
  - Total spending
  - Best streak this month

---

## Tab 3 — Discover

### Screen 3.1 — Discover Feed
**Header:**
- Title: "Discover"
- 🔍 Search icon | ⊞ Filter icon

**Tabs:**
- DISCOVER | FAVORITES

**DISCOVER tab body:**
- Search bar (searches TheMealDB on submit)
- Section: Popular Categories (horizontal scroll)
  - Emoji icon chips: Breakfast | Lunch | Dinner | Vegan | Protein | Low Calorie | ...
- Section: By Calorie Range (2×3 grid)
  - Cards with food emoji: 50-100 | 100-200 | 200-300 | 300-400 | 400-500 | 500-600 kcal
- Section: From Around the World (horizontal scroll, large cards)
  - Real food photo + cuisine name + recipe count
  - e.g. "Mexican Cuisine — 58 recipes"
- Section: Pick Your Meal (horizontal scroll)
  - Large visual cards: Breakfast | Lunch | Dinner | Snack
- Section: What Should I Cook Today? 🎲
  - "Random Recipe" button
  - Recipe card with flip animation on each press
  - "Not feeling it? Try another" button

**FAVORITES tab body:**
- Grid of favorited recipes
- Empty state: avatar + "No favorites yet" + "Start Discovering" button

### Screen 3.2 — Discover Recipe Detail
Same layout as Screen 1.2 (Recipe Detail) with one difference:
- Bottom bar shows "Add to My Recipes" (primary) + "Add to Daily Log" (secondary)
- No "Edit" button (it's not the user's recipe)

### Screen 3.3 — Meal Plan
**Header:**
- Back button
- Title: "Meal Plan"

**Body:**
- Inputs:
  - Calorie goal (pre-filled from profile)
  - Daily budget (₺, pre-filled from profile)
  - Plan duration: 1 day | 3 days | 7 days
- "Generate Plan" button
- Loading state: avatar animation while generating
- Plan result:
  - Day-by-day layout
  - Each day shows: Breakfast | Lunch | Dinner | Snack
  - Each meal: recipe image + name + calories + cost
  - Daily totals: X kcal | ₺XX.XX
  - Plan totals at bottom
- "Apply This Plan" button → adds all meals to daily log
- "Regenerate" button

---

## Tab 4 — Activity

### Screen 4.1 — Activity Summary
**Header:**
- Title: "Activity"
- Date indicator (today's date)

**Body:**
- Burned Calories ring (large, centered):
  - Steps calories + exercise calories
  - Animated fill
- Steps card:
  - Step count (large number)
  - Step goal progress bar
  - "X steps to goal"
  - Source: Health app or pedometer
- Today's Exercises list:
  - Each item: exercise icon | type | duration | burned calories
  - Swipe to delete
  - "+ Add Exercise" button
- Streak Calendar preview (last 7 days mini-view)
  - "View Full Calendar" link → Screen 4.3

### Screen 4.2 — Add Exercise
**Header:**
- Back button
- Title: "Add Exercise"

**Body:**
- Exercise type selector (grid of icons):
  - 🏃 Running | 🚴 Cycling | 🏋️ Fitness | 🚶 Walking
  - 🏊 Swimming | ⚽ Football | 🧘 Yoga | 🤸 Other
- Duration input (minutes)
- Auto-calculated burned calories preview:
  - Based on exercise type + user weight + duration
  - Formula shown: "Calculation based on your profile (X kg)"
- Notes input (optional)
- Save button

### Screen 4.3 — Streak Calendar
**Header:**
- Back button
- Title: "My Streak"

**Body:**
- Current streak badge (large, animated): "🔥 X Days"
- Longest streak: "Best: X days"
- Avatar with motivational message
- Full calendar (monthly view):
  - Green days: goal completed ✅
  - Red days: goal missed ❌
  - Grey days: no data
  - Today highlighted
- Month navigation (← →)
- Motivational messages based on streak length:
  - 0-3 days: "Keep going, you're just getting started!"
  - 7 days: "One week strong! 🎉"
  - 30 days: "A whole month! You're unstoppable! 🚀"

---

## Tab 5 — Profile

### Screen 5.1 — Profile Main
**Header:**
- Title: "Profile"
- Edit button (top right)

**Body:**
- Avatar (customizable character)
- User name (large)
- Section: Personal Info
  - Gender | Age | Height | Weight
  - Body fat % (with "Calculate" link → Body Fat Modal)
- Section: Goals & Targets
  - Current goal chip (e.g. "Lose Weight")
  - Daily calorie goal
  - Daily macro goals (protein / carbs / fat)
  - Daily budget goal
  - "Change Goal" button → re-runs goal selection
- Section: Statistics
  - Total spending this month
  - Average daily calories this month
  - Most cooked recipe
  - Total calories burned (all time)
  - Longest streak
- Section: My Ingredients
  - Quick link → My Ingredients screen
- Section: Settings
  - Notification toggles
  - Meal reminder times
  - Water reminder interval + active hours
  - Weekly summary day
  - Step goal
  - Data retention period (default: 1 year)
- Section: Health App
  - Connection status (Connected / Not Connected)
  - Connect / Disconnect button
  - What data is shared (read/write list)

### Body Fat Modal (Bottom Sheet)
- Title: "Calculate Body Fat %"
- Formula info: "Using U.S. Navy Formula"
- Inputs:
  - Waist circumference (cm)
  - Neck circumference (cm)
  - Hip circumference (cm) — shown only for female
- "Calculate" button
- Result display:
  - "Your body fat: X%"
  - Category badge: Essential / Fit / Average / Above Average / Obese
- "Save to Profile" button
- "Close" button

---

## Shared / Reusable Screens

### Filter Panel (Bottom Sheet)
Used in: Discover Feed, Recipe search

**Filters:**
- Category (multi-select chips)
- Cuisine (multi-select chips)
- Calorie range (dual slider: 0 – 1000+ kcal)
- Cost range (dual slider: ₺0 – ₺500+)
- Macro type (High Protein / Low Carb / Low Fat / Vegan / Vegetarian)

**Sort by:**
- Relevance (default)
- Lowest calorie
- Highest calorie
- Cheapest
- Most expensive
- Most popular

- "Apply Filters" button
- "Reset" link

---

## Screen Count Summary

| Tab | Screens |
|---|---|
| Onboarding | 7 |
| Recipes | 6 |
| Daily Log | 3 |
| Discover | 3 |
| Activity | 3 |
| Profile | 1 + 1 modal |
| Shared | 1 bottom sheet |
| **Total** | **~25** |
