# Loading States & Skeleton UI Reference

## Skeleton Shimmer Animation (react-native-reanimated)

```typescript
// components/ui/SkeletonRow.tsx

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '@/constants/colors'

export function SkeletonRow({ width = '100%', height = 16, borderRadius = 8 }) {
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700 }),
        withTiming(0.4, { duration: 700 })
      ),
      -1, // infinite
      false
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        style,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
      ]}
    />
  )
}
```

## IngredientRow with Loading State

```typescript
// components/recipes/IngredientRow.tsx — loading variant

import { SkeletonRow } from '@/components/ui/SkeletonRow'
import { IngredientCalcState } from '@/hooks/useRecipeCalculation'

function IngredientRowSkeleton() {
  return (
    <View style={styles.row}>
      {/* Image placeholder */}
      <View style={[styles.image, { backgroundColor: colors.borderLight }]} />
      <View style={styles.center}>
        <SkeletonRow width={120} height={14} />
        <View style={{ height: 4 }} />
        <SkeletonRow width={80} height={11} />
      </View>
      <View style={styles.right}>
        <SkeletonRow width={50} height={14} />
        <View style={{ height: 4 }} />
        <SkeletonRow width={40} height={11} />
      </View>
    </View>
  )
}

export function IngredientRow({ ingredient }: { ingredient: IngredientCalcState }) {
  if (ingredient.status === 'pending' || ingredient.status === 'calculating') {
    return <IngredientRowSkeleton />
  }

  if (ingredient.requiresManualInput) {
    return <ManualInputRow ingredient={ingredient} />
  }

  if (ingredient.status === 'error') {
    return <ErrorRow nameEn={ingredient.nameEn} />
  }

  return (
    <View style={styles.row}>
      {ingredient.migrosProduct?.imageUrl ? (
        <Image source={{ uri: ingredient.migrosProduct.imageUrl }} style={styles.image} />
      ) : (
        <PlaceholderImage />
      )}
      <View style={styles.center}>
        <Text style={styles.name}>{ingredient.nameTr ?? ingredient.nameEn}</Text>
        <Text style={styles.measure}>{ingredient.measure}</Text>
        {ingredient.grams && (
          <Text style={styles.grams}>≈ {Math.round(ingredient.grams)}g</Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={styles.cost}>
          {ingredient.costTL ? `₺${ingredient.costTL.toFixed(2)}` : '—'}
        </Text>
        <Text style={styles.calories}>
          {ingredient.calories ? `${Math.round(ingredient.calories)} kcal` : '—'}
        </Text>
      </View>
    </View>
  )
}
```

## Animated Totals Counter

When totals update as ingredients resolve, animate the number:

```typescript
// In RecipeDetailHeader — animating calorie total

import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated'
import AnimatedText from 'react-native-reanimated' // or use a custom wrapper

const animatedCalories = useSharedValue(0)

useEffect(() => {
  if (totalCalories !== null) {
    animatedCalories.value = withTiming(totalCalories, { duration: 400 })
  }
}, [totalCalories])

// Display: Math.round(animatedCalories.value) in UI
```

## Progress Bar

```typescript
// Below totals row in RecipeDetailHeader

{!isComplete && (
  <View style={styles.progressContainer}>
    <Text style={styles.progressLabel}>
      Hesaplanıyor... ({completedCount}/{totalCount} malzeme)
    </Text>
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          { width: `${(completedCount / totalCount) * 100}%` }
        ]}
      />
    </View>
  </View>
)}

// Styles:
// progressTrack: height 4, borderRadius 2, backgroundColor colors.borderLight
// progressFill: height 4, borderRadius 2, backgroundColor colors.primary
```

## Toast for Early "Günlüğe Ekle"

```typescript
// Show when user adds to log before isComplete

// In Toast.tsx (existing component):
<Toast
  message="Tarif henüz tam hesaplanmadı. Mevcut verilerle eklendi — hesaplama bitince güncellenir."
  type="warning"
  duration={4000}
/>
```
