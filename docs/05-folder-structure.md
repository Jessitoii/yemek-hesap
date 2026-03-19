# 05 — Folder Structure

## Overview

The project uses **Expo + expo-router** with a file-based routing system. The `app/` directory maps directly to navigation routes. All business logic lives outside `app/` in dedicated layers.

---

## Full Structure

```
kalori-tabak/
│
├── app/                                  # expo-router: file = route
│   ├── _layout.tsx                       # root layout: fonts, theme, DB init, notification setup
│   │
│   ├── (onboarding)/                     # shown only when onboarding_completed = 0
│   │   ├── _layout.tsx                   # onboarding navigator (no tab bar)
│   │   ├── index.tsx                     # slide 1: welcome + name input
│   │   ├── slide2.tsx                    # slide 2: cost intro
│   │   ├── slide3.tsx                    # slide 3: calorie intro
│   │   ├── slide4.tsx                    # slide 4: goal selection
│   │   ├── slide5.tsx                    # slide 5: profile info
│   │   ├── slide6.tsx                    # slide 6: activity level
│   │   └── slide7.tsx                    # slide 7: ready + calculated targets
│   │
│   └── (tabs)/                           # main app tabs
│       ├── _layout.tsx                   # tab bar configuration
│       │
│       ├── recipes/
│       │   ├── _layout.tsx
│       │   ├── index.tsx                 # recipe list
│       │   ├── new.tsx                   # new recipe form
│       │   ├── [id].tsx                  # recipe detail
│       │   ├── ingredient-match.tsx      # migros product matching flow
│       │   ├── my-ingredients/
│       │   │   ├── index.tsx             # my ingredients list
│       │   │   └── [id].tsx             # add / edit ingredient
│       │
│       ├── daily/
│       │   ├── _layout.tsx
│       │   ├── index.tsx                 # daily summary
│       │   ├── add-meal.tsx              # add meal item
│       │   └── history.tsx              # calendar + charts
│       │
│       ├── discover/
│       │   ├── _layout.tsx
│       │   ├── index.tsx                 # discover feed (keşfet + favorites tabs)
│       │   ├── [id].tsx                 # discover recipe detail
│       │   └── meal-plan.tsx            # meal plan generator
│       │
│       ├── activity/
│       │   ├── _layout.tsx
│       │   ├── index.tsx                 # activity summary
│       │   ├── add-exercise.tsx          # add exercise
│       │   └── streak.tsx               # streak calendar
│       │
│       └── profile/
│           ├── _layout.tsx
│           └── index.tsx                 # profile main (includes body fat modal inline)
│
├── components/                           # reusable UI components
│   │
│   ├── ui/                               # generic, app-agnostic components
│   │   ├── Button.tsx                    # primary, secondary, ghost variants
│   │   ├── Card.tsx                      # base card with shadow + border radius
│   │   ├── Input.tsx                     # text input with label + error state
│   │   ├── Modal.tsx                     # bottom sheet modal wrapper
│   │   ├── Badge.tsx                     # small colored label (e.g. cuisine, category)
│   │   ├── Chip.tsx                      # selectable filter chip
│   │   ├── Divider.tsx
│   │   ├── EmptyState.tsx               # avatar + message + optional CTA
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProgressBar.tsx              # flat animated progress bar
│   │   ├── ProgressRing.tsx             # circular animated progress ring
│   │   ├── Avatar.tsx                   # KaloriTabak mascot with animation states
│   │   └── Toast.tsx                    # brief notification message
│   │
│   ├── recipes/
│   │   ├── RecipeCard.tsx               # card for recipe list (image, name, cost, calories)
│   │   ├── RecipeDetailHeader.tsx       # full-width image + stats row
│   │   ├── IngredientRow.tsx            # single ingredient in recipe detail
│   │   ├── IngredientMatchList.tsx      # migros product selection list
│   │   ├── MigrosProductCard.tsx        # single migros product in search results
│   │   ├── QuantityInput.tsx            # amount + unit selector + gram preview
│   │   ├── PriceHistory.tsx             # expandable price history table
│   │   ├── MacroBar.tsx                 # protein/carbs/fat progress bars
│   │   └── FavoriteButton.tsx           # heart icon with toggle animation
│   │
│   ├── daily/
│   │   ├── CalorieRing.tsx              # large animated calorie ring
│   │   ├── DailyStatsRow.tsx            # calories | spending | steps | burned row
│   │   ├── MealSection.tsx              # breakfast/lunch/dinner/snack section
│   │   ├── MealItemRow.tsx              # single logged meal item
│   │   ├── MacroSummary.tsx             # daily macro progress bars
│   │   └── RecipeSuggestionCard.tsx     # smart recipe suggestion card
│   │
│   ├── discover/
│   │   ├── DiscoverCard.tsx             # recipe card for discover feed
│   │   ├── CategoryChip.tsx             # emoji + label category pill
│   │   ├── CalorieRangeCard.tsx         # 2x3 grid calorie range card
│   │   ├── CuisineCard.tsx              # large card with food photo + cuisine name
│   │   ├── RandomRecipeCard.tsx         # flippable random recipe card
│   │   └── FilterPanel.tsx             # bottom sheet with filters + sorting
│   │
│   ├── activity/
│   │   ├── BurnedCaloriesRing.tsx       # burned calories circular display
│   │   ├── StepsCard.tsx               # step count + goal progress
│   │   ├── ExerciseCard.tsx            # single exercise entry
│   │   ├── ExerciseTypeGrid.tsx        # icon grid for exercise type selection
│   │   └── StreakCalendar.tsx          # monthly calendar with completion dots
│   │
│   ├── onboarding/
│   │   ├── SlideContainer.tsx          # wrapper with progress dots + next button
│   │   ├── GoalOption.tsx              # single selectable goal chip
│   │   └── ActivityLevelOption.tsx     # single activity level card
│   │
│   └── profile/
│       ├── ProfileSection.tsx          # labeled section with border
│       ├── StatCard.tsx                # single statistic display
│       ├── GoalDisplay.tsx             # current goal + targets display
│       └── BodyFatModal.tsx            # body fat calculation bottom sheet
│
├── services/                           # external API calls (pure functions, no state)
│   ├── migros.ts                       # searchProducts(query) → MigrosProduct[]
│   ├── themealdb.ts                    # searchRecipes(), getRecipeById(), getCategories(), getRandom()
│   ├── openfoodfacts.ts               # getNutrition(query) → NutritionData | null
│   ├── usda.ts                         # getNutrition(query) → NutritionData | null (fallback)
│   ├── mymemory.ts                     # translate(text, from, to) → string
│   ├── unsplash.ts                     # searchImages(query) → ImageResult[]
│   ├── ddgs.ts                         # searchImages(query) → ImageResult[]
│   ├── cerebras.ts                     # generateMealPlan(params) → MealPlan
│   └── health.ts                       # platform-aware HealthKit / Health Connect wrapper
│
├── stores/                             # zustand global state
│   ├── userStore.ts                    # profile, goals, settings, onboardingCompleted
│   ├── recipesStore.ts                 # recipes[], ingredients[], favorites[]
│   ├── dailyStore.ts                   # selectedDate, todayLog, suggestion
│   └── activityStore.ts               # todaySteps, burnedCalories, exercises[], streak
│
├── db/                                 # sqlite database layer
│   ├── index.ts                        # open connection, run pending migrations
│   ├── migrations/
│   │   ├── 001_user.ts
│   │   ├── 002_ingredients.ts
│   │   ├── 003_recipes.ts
│   │   ├── 004_recipe_ingredients.ts
│   │   ├── 005_price_history.ts
│   │   ├── 006_daily_log.ts
│   │   ├── 007_meals.ts
│   │   ├── 008_activity_log.ts
│   │   ├── 009_streak.ts
│   │   ├── 010_meal_plans.ts
│   │   └── 011_cache.ts
│   └── queries/
│       ├── user.ts
│       ├── recipes.ts
│       ├── ingredients.ts
│       ├── dailyLog.ts
│       ├── meals.ts
│       ├── activity.ts
│       ├── streak.ts
│       ├── mealPlans.ts
│       └── cache.ts
│
├── utils/                              # pure helper functions (no side effects)
│   ├── calorieCalc.ts                  # BMR, TDEE, goal-based targets (Mifflin-St Jeor)
│   ├── macroCalc.ts                    # macro goals from goal type + TDEE
│   ├── bodyFatCalc.ts                  # U.S. Navy body fat formula
│   ├── exerciseCalc.ts                 # burned calories from exercise type + duration + weight
│   ├── unitConverter.ts               # amount + unit → grams (uses densityTable)
│   ├── densityTable.ts                # 150-200 ingredients with grams per unit
│   ├── recipeSuggestion.ts            # smart recipe suggestion logic
│   ├── priceCalc.ts                   # cost calculations from grams + price
│   ├── formatters.ts                  # formatCurrency(), formatCalories(), formatDate()
│   └── uuid.ts                         # generateId() helper
│
├── hooks/                              # custom React hooks
│   ├── useMigrosSearch.ts             # debounced migros search with cache
│   ├── useTranslate.ts                # translate with SQLite cache
│   ├── useNutrition.ts                # OpenFoodFacts → USDA fallback
│   ├── usePedometer.ts                # expo-pedometer with health fallback
│   ├── useNotifications.ts            # schedule/cancel local notifications
│   └── useHealthKit.ts                # health app read/write with permission handling
│
├── constants/
│   ├── colors.ts                       # full color palette
│   ├── typography.ts                   # font sizes, weights, line heights
│   ├── theme.ts                        # spacing, border radius, shadows
│   ├── exercises.ts                    # exercise types + MET values for calorie calc
│   └── routes.ts                       # typed route constants
│
├── types/                              # TypeScript type definitions
│   ├── user.ts                         # UserProfile, UserGoals, AppSettings
│   ├── recipe.ts                       # Recipe, RecipeIngredient
│   ├── ingredient.ts                   # Ingredient, MigrosProduct, NutritionData
│   ├── daily.ts                        # DailyLog, Meal, MealType
│   ├── activity.ts                     # Exercise, ExerciseType, StreakDay
│   ├── mealPlan.ts                     # MealPlan, MealPlanItem
│   └── api.ts                          # API response types (Migros, TheMealDB, etc.)
│
├── assets/
│   ├── fonts/                          # custom fonts
│   ├── images/                         # static images (logo, placeholders)
│   └── animations/                     # Lottie JSON files (avatar states, celebrations)
│
├── docs/                               # project documentation
│   ├── README.md
│   ├── 01-features.md
│   ├── 02-architecture.md
│   ├── 03-screens.md
│   ├── 04-database.md
│   ├── 05-folder-structure.md
│   ├── 06-ui-design.md
│   ├── 07-notifications.md
│   ├── 08-onboarding.md
│   └── 09-api-integrations.md
│
├── .env                                # API keys (Unsplash, USDA)
├── app.json                            # Expo config
├── eas.json                            # EAS Build config
├── tsconfig.json
└── package.json
```

---

## Key Architectural Decisions

### Why file-based routing (expo-router)?
No manual navigation config. Adding a new screen = creating a new file. Routes are typed automatically.

### Why separate `services/` from `hooks/`?
- `services/` = pure async functions. No React, no state. Easy to test.
- `hooks/` = React wrappers around services + local state (loading, error, cache).

### Why separate `db/queries/` from `stores/`?
- `db/queries/` = raw database operations. Returns plain data.
- `stores/` = in-memory state. Calls queries, holds results for UI.
- Components never touch the database directly.

### Why `utils/` has no side effects?
All calculation logic (BMR, macros, unit conversion, recipe suggestion) is pure. Takes input, returns output. Easy to unit test, easy to reason about.

### Why `types/` is separate?
Shared types used across services, stores, components, and queries. Single source of truth — change once, TypeScript catches all mismatches.
