---
name: new-component
description: Use when building a new reusable UI component for KaloriTabak. Triggers on "component oluştur", "yeni bileşen", "card yap", "buton ekle", "UI component".
---

# New Component Skill

## Use this skill when
- Creating any reusable component under `components/`
- Building a new card, button, modal, progress ring, or list item

## Do not use this skill when
- Building a full screen (use `new-screen` skill)
- Editing an existing component

## Instructions

1. **Determine the folder:**
   - Generic (button, input, modal) → `components/ui/`
   - Recipe-related → `components/recipes/`
   - Daily log → `components/daily/`
   - Discover → `components/discover/`
   - Activity → `components/activity/`
   - Profile → `components/profile/`

2. **Component file structure:**
```tsx
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors } from '@/constants/colors'
import { spacing, radius, shadow } from '@/constants/theme'
import { typography } from '@/constants/typography'

interface MyComponentProps {
  title: string
  onPress?: () => void
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    ...shadow.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  title: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
})
```

3. **Color tokens** — never hardcode hex:
   - Backgrounds: `colors.surface`, `colors.background`, `colors.surfaceAlt`
   - Primary action: `colors.primary`
   - Text: `colors.textPrimary`, `colors.textSecondary`
   - Borders: `colors.border`, `colors.borderLight`

4. **Animations** — use `react-native-reanimated`:
```tsx
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'

const scale = useSharedValue(1)
const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
// on press: scale.value = withSpring(0.97)
```

5. **Icons** — Phosphor only:
```tsx
import { Heart, Plus, ArrowLeft } from 'phosphor-react-native'
<Heart size={24} color={colors.pink} weight="fill" />
```

6. **Progress Ring** — already built as `components/ui/ProgressRing.tsx`, reuse it.

7. **Export** — named export (not default) for components.

## References
- Design system: `docs/06-ui-design.md`
- Colors: `constants/colors.ts`
- Theme tokens: `constants/theme.ts`