# KaloriTabak — Agent Rules

These rules are always active in every agent session.

---

## Project Identity

- **App name:** KaloriTabak
- **Platform:** React Native (Expo) — iOS + Android
- **Language:** TypeScript (strict mode)
- **Navigation:** expo-router v3 (file-based routing)
- **State:** Zustand
- **Database:** expo-sqlite (local only, no backend)
- **Target locale:** Turkish (TR) — all UI strings in Turkish

---

## Architecture Principles

- **Fully client-side. Zero backend. Zero cost.** Never suggest adding a server, cloud DB, or auth layer.
- All persistent data goes through `db/queries/*.ts` — no raw SQL in components or stores.
- Components never import from `db/` directly — they use Zustand stores only.
- Stores call `db/queries/`, not raw expo-sqlite.
- Services (`services/`) are pure async functions — no React, no state, no side effects beyond the API call.
- Utils (`utils/`) are pure functions — no async, no imports from services/db/stores.

---

## Code Conventions

- All IDs are UUIDs generated via `utils/uuid.ts` → `generateId()`
- Dates stored as `'YYYY-MM-DD'` strings in SQLite
- Prices stored as **kuruş (integer)** in DB, converted to TL only in display layer
- Never use `any` — define proper types in `types/`
- All new types go in the appropriate file under `types/`
- Imports use absolute paths from project root (configured in `tsconfig.json`)

---

## UI Rules

- **Light theme only** — no dark mode
- Font: **Nunito** (via `@expo-google-fonts/nunito`)
- All colors from `constants/colors.ts` — no hardcoded hex values in components
- All spacing from `constants/theme.ts` spacing/radius/shadow tokens
- Icons from **Phosphor Icons** (`phosphor-react-native`) only
- Border radius: always use token (never raw pixel)
- Animations via `react-native-reanimated` only — no Animated API

---

## API & Caching Rules

- Migros search: always debounce 500ms, always check `migros_cache` first
- Translations: always check `translations` SQLite table before calling MyMemory
- Calorie data: always check `calorie_cache` before calling OpenFoodFacts/USDA
- Never call Cerebras API for single-day suggestions — rule engine only
- All API keys must come from `.env` via `process.env.EXPO_PUBLIC_*`

---

## File Naming

- Screens: `kebab-case.tsx` under `app/`
- Components: `PascalCase.tsx` under `components/`
- Services: `camelCase.ts` under `services/`
- Utils: `camelCase.ts` under `utils/`
- Stores: `camelCaseStore.ts` under `stores/`

---

## What NOT to Do

- Do not add React Navigation — expo-router only
- Do not add Redux or MobX — Zustand only
- Do not add a backend, REST API, or database server
- Do not use `StyleSheet.create` for complex layouts — use inline styles with theme tokens
- Do not write raw SQL outside `db/queries/`
- Do not hardcode Turkish strings inline — keep them consistent and extractable
- Do not call health APIs without a platform check (iOS vs Android)