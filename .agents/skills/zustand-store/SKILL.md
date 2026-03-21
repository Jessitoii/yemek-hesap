---
name: zustand-store
description: Use when adding new state, actions, or selectors to a Zustand store in KaloriTabak. Triggers on "store'a ekle", "state güncelle", "zustand", "global state", "store action".
---

# Zustand Store Skill

## Use this skill when
- Adding a new field or action to an existing store
- Creating a new store
- Connecting a screen to store data

## Do not use this skill when
- Writing the underlying DB query (use `new-db-query` skill first)
- Sharing data between stores — use selectors, not cross-store imports

## Store Files

| Store | File | Owns |
|---|---|---|
| User | `stores/userStore.ts` | profile, goals, settings, onboardingCompleted |
| Recipes | `stores/recipesStore.ts` | recipes[], ingredients[], favorites[] |
| Daily Log | `stores/dailyStore.ts` | selectedDate, todayLog, suggestion |
| Activity | `stores/activityStore.ts` | todaySteps, burnedCalories, exercises[], streak |

## Instructions

### Adding an Action to an Existing Store
```typescript
// stores/recipesStore.ts
import { create } from 'zustand'
import { saveRecipe, getRecipes, deleteRecipe } from '@/db/queries/recipes'
import type { Recipe } from '@/types/recipe'

interface RecipesState {
  recipes: Recipe[]
  isLoading: boolean
  loadRecipes: () => Promise<void>
  addRecipe: (recipe: Recipe) => Promise<void>
  removeRecipe: (id: string) => Promise<void>
}

export const useRecipesStore = create<RecipesState>((set, get) => ({
  recipes: [],
  isLoading: false,

  loadRecipes: async () => {
    set({ isLoading: true })
    const recipes = await getRecipes()
    set({ recipes, isLoading: false })
  },

  addRecipe: async (recipe) => {
    await saveRecipe(recipe)
    set(state => ({ recipes: [recipe, ...state.recipes] }))
  },

  removeRecipe: async (id) => {
    await deleteRecipe(id)
    set(state => ({ recipes: state.recipes.filter(r => r.id !== id) }))
  },
}))
```

### Using a Store in a Component
```typescript
// Correct: select only what you need (avoids unnecessary re-renders)
const recipes = useRecipesStore(state => state.recipes)
const addRecipe = useRecipesStore(state => state.addRecipe)

// Wrong: selecting entire store
const store = useRecipesStore()
```

### Initializing Stores on App Launch
Load stores in `app/_layout.tsx` after DB is ready:
```typescript
useEffect(() => {
  async function init() {
    await initDb()           // run migrations
    await loadRecipes()      // hydrate stores from SQLite
    await loadUser()
    await loadTodayLog()
  }
  init()
}, [])
```

### Creating a New Store
1. Create `stores/myNewStore.ts` with the pattern above
2. Define the interface with state fields + async actions
3. Actions always write to DB first, then update in-memory state
4. Export a single `useMyNewStore` hook

## References
- Architecture: `docs/02-architecture.md` (Zustand Stores section)