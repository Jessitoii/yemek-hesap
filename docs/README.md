# KaloriTabak 🍽️

A Turkish mobile app for real-time **meal cost + calorie tracking** using live Migros grocery prices.

---

## What Does It Do?

KaloriTabak calculates both the calorie content and the real-time cost (based on current Migros prices) of your meals. Daily meal tracking, exercise logging, weekly charts, and smart recipe suggestions — all in one app.

---

## Why KaloriTabak?

There are dozens of calorie-tracking apps on the market. But none of them combine **cost + calorie balance** simultaneously, localized for Turkey, in Turkish, with real-time price fetching. KaloriTabak fills this gap.

**Target audience:**
- Students who work out (budget + macro balance)
- Home cooks (calculating dinner costs)
- Anyone who wants to track healthy eating habits

---

## Core Features

- 🛒 Recipe cost calculation using live Migros prices
- 🔥 Calorie + macro (protein, carbs, fat) tracking
- 📅 Daily / weekly / monthly meal and calorie logging
- 🏃 Exercise entry + pedometer integration
- 🔗 Habit streak calendar (Don't Break the Chain)
- 🍳 Thousands of recipes from TheMealDB (translated to Turkish)
- 💡 Smart recipe suggestions based on remaining calories
- 📊 Price history and change tracking
- 🍎 Apple HealthKit + Google Health Connect integration

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo + React Native |
| Navigation | expo-router |
| State Management | Zustand |
| Database | expo-sqlite |
| Health Integration | react-native-health + react-native-health-connect |
| Notifications | expo-notifications |
| Pedometer | expo-pedometer |

---

## Data Sources

| Source | Usage | Cost |
|---|---|---|
| Migros API | Live grocery prices | Free (unofficial) |
| TheMealDB | Recipes + ingredients | Free |
| OpenFoodFacts | Calories + macros | Free |
| USDA FoodData | Macro fallback | Free |
| MyMemory | English → Turkish translation | Free (1000 req/day) |
| Unsplash | Recipe images | Free |
| Cerebras API | Meal plan suggestions (fallback) | Free tier |

---

## Architectural Principle

**Fully client-side. Zero backend. Zero cost.**

All data is stored locally on the user's device in SQLite. External APIs are used only to fetch data — nothing is written to any server.

---

## Documentation

| File | Content |
|---|---|
| [01-features.md](./01-features.md) | All features + edge cases |
| [02-architecture.md](./02-architecture.md) | Stack + data sources + flow |
| [03-screens.md](./03-screens.md) | All screens + user flows |
| [04-database.md](./04-database.md) | SQLite schemas |
| [05-folder-structure.md](./05-folder-structure.md) | Folder structure |
| [06-ui-design.md](./06-ui-design.md) | Colors + theme + avatar |
| [07-notifications.md](./07-notifications.md) | Notification plan |
| [08-onboarding.md](./08-onboarding.md) | Onboarding flow |
| [09-api-integrations.md](./09-api-integrations.md) | All APIs + usage |

---

## Quick Start

```bash
# Create project
npx create-expo-app kalori-tabak
cd kalori-tabak

# Install dependencies
npx expo install expo-router expo-sqlite expo-notifications expo-pedometer
npm install zustand

# Start development server
npx expo start
```

---

## Important Notes

- Migros API is unofficial — if the endpoint changes, update `services/migros.ts`
- MyMemory has a 1000 requests/day limit; translations are cached to avoid hitting it
- Health integration requires EAS Build or a custom dev client
- All calorie and cost values are estimates; check product labels for precise information
