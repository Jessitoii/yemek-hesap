---
name: new-screen
description: Use when creating a new screen or page in the KaloriTabak app. Triggers on "add a screen", "create a new tab", "new route", "yeni ekran", "ekran oluştur".
---

# New Screen Skill

## Use this skill when
- Adding a new screen to any tab (recipes, daily, discover, activity, profile)
- Creating a new onboarding slide
- Adding a modal or bottom sheet screen

## Do not use this skill when
- Creating a reusable component (use `new-component` skill instead)
- Editing an existing screen

## Instructions

1. **Determine the route path** from the screen's place in `app/` folder structure (see `05-folder-structure.md`)

2. **Create the screen file** at the correct path under `app/(tabs)/` or `app/(onboarding)/`

3. **Screen file structure:**
```tsx
import { View, Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { colors } from '@/constants/colors'
import { spacing } from '@/constants/theme'

export default function ScreenName() {
  return (
    <>
      <Stack.Screen options={{ title: 'Başlık' }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: spacing.base }}>
          {/* content */}
        </View>
      </ScrollView>
    </>
  )
}
```

4. **Connect to Zustand store** if the screen needs data:
```tsx
import { useRecipesStore } from '@/stores/recipesStore'
const { recipes } = useRecipesStore()
```

5. **Navigation links** use typed routes from `constants/routes.ts`:
```tsx
import { router } from 'expo-router'
router.push('/recipes/new')
```

6. **Empty state** — if the screen can be empty, use `<EmptyState>` component with avatar.

## References
- Screen designs: `docs/03-screens.md`
- Folder structure: `docs/05-folder-structure.md`
- Colors/theme: `docs/06-ui-design.md`