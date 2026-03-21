export const routes = {
  onboarding: {
    welcome: '/(onboarding)/index' as const,
    slide2: '/(onboarding)/slide2' as const,
    slide3: '/(onboarding)/slide3' as const,
    slide4: '/(onboarding)/slide4' as const,
    slide5: '/(onboarding)/slide5' as const,
    slide6: '/(onboarding)/slide6' as const,
    slide7: '/(onboarding)/slide7' as const,
  },
  tabs: {
    recipes: {
      index: '/(tabs)/recipes/index' as const,
      detail: (id: string) => `/(tabs)/recipes/${id}` as const,
      new: '/(tabs)/recipes/new' as const,
      ingredientMatch: '/(tabs)/recipes/ingredient-match' as const,
      myIngredients: {
        index: '/(tabs)/recipes/my-ingredients/index' as const,
        edit: (id: string) => `/(tabs)/recipes/my-ingredients/${id}` as const,
        new: '/(tabs)/recipes/my-ingredients/new' as const,
      },
    },
    daily: {
      index: '/(tabs)/daily/index' as const,
      addMeal: '/(tabs)/daily/add-meal' as const,
      history: '/(tabs)/daily/history' as const,
    },
    discover: {
      index: '/(tabs)/discover/index' as const,
      detail: (id: string) => `/(tabs)/discover/${id}` as const,
      mealPlan: '/(tabs)/discover/meal-plan' as const,
    },
    activity: {
      index: '/(tabs)/activity/index' as const,
      addExercise: '/(tabs)/activity/add-exercise' as const,
      streak: '/(tabs)/activity/streak' as const,
    },
    profile: {
      index: '/(tabs)/profile/index' as const,
    },
  },
};
