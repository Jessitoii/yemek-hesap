import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  PencilSimple,
  CaretDown,
  CaretUp,
  ArrowsClockwise,
  BookOpen
} from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRecipesStore } from '@/stores/recipesStore';
import { RecipeDetailHeader } from '@/components/recipes/RecipeDetailHeader';
import { MacroBar } from '@/components/recipes/MacroBar';
import { IngredientRow } from '@/components/recipes/IngredientRow';
import { PriceHistory } from '@/components/recipes/PriceHistory';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useRecipeCalculation } from '@/hooks/useRecipeCalculation';
import { useDailyStore } from '@/stores/dailyStore';
import { MealType } from '@/types/daily';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { recipes, loadRecipes, updateRecipe, loadIngredients, ingredients: allStoreIngredients } = useRecipesStore();
  const { addMeal } = useDailyStore();
  const insets = useSafeAreaInsets();

  const recipe = useMemo(() => recipes.find(r => r.id === id), [recipes, id]);

  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(true);
  const [addedMealId, setAddedMealId] = useState<string | null>(null);

  // Performance Fix: Only calculate if it's a TheMealDB recipe AND has no calories/cost yet, 
  // or if the user explicitly triggered a price update.
  const shouldCalculate = recipe?.source === 'TheMealDB' && (isUpdatingPrices || !recipe.totalCalories || recipe.totalCalories === 0);

  const calc = useRecipeCalculation(
    shouldCalculate ? recipe?.name || '' : '',
    shouldCalculate ? recipe?.ingredients?.map(i => ({ 
      nameEn: i.name, 
      measure: `${i.amount} ${i.unit}` 
    })) || [] : []
  );

  useEffect(() => {
    if (recipes.length === 0) {
      loadRecipes();
    }
    loadIngredients();
  }, []);

  // Sync meal data when calculation reaches 100%
  useEffect(() => {
    if (calc.isComplete && addedMealId) {
      const { updateMeal } = useDailyStore.getState();
      updateMeal(addedMealId, {
        calories: calc.totalCalories || 0,
        cost: calc.totalCost || 0,
        macros: {
          protein: calc.totalProtein || 0,
          carbs: calc.totalCarbs || 0,
          fat: calc.totalFat || 0
        }
      }).then(() => {
        setAddedMealId(null);
      });
    }
  }, [calc.isComplete, addedMealId, calc.totalCalories, calc.totalCost, calc.totalProtein, calc.totalCarbs, calc.totalFat]);

  const handleUpdatePrices = async () => {
    setIsUpdatingPrices(true);
    // Simulation for now, will implement properly in Checkpoint 5.3+
    setTimeout(async () => {
      setIsUpdatingPrices(false);
      // In a real scenario, we'd call a service to fetch latest prices for all ingredients
      // and then update the recipe in the store
    }, 2000);
  };

  const toggleInstructions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsInstructionsExpanded(!isInstructionsExpanded);
  };

  if (!recipe) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <RecipeDetailHeader 
          recipe={{
            ...recipe,
            totalCalories: recipe.source === 'TheMealDB' ? calc.totalCalories : recipe.totalCalories,
            totalCost: recipe.source === 'TheMealDB' ? calc.totalCost : recipe.totalCost,
          }}
          isComplete={recipe.source === 'TheMealDB' ? calc.isComplete : true}
          completedCount={calc.completedCount}
          totalCount={calc.totalCount}
        />

        <View style={styles.content}>
          {/* Macro Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Makro Dağılımı</Text>
            <MacroBar
              protein={recipe.macros.protein}
              carbs={recipe.macros.carbs}
              fat={recipe.macros.fat}
            />
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Malzemeler ({recipe.ingredients.length})</Text>
              <TouchableOpacity
                style={styles.updatePricesBtn}
                onPress={handleUpdatePrices}
                disabled={isUpdatingPrices}
              >
                {isUpdatingPrices ? (
                  <ActivityIndicator size={14} color={colors.primary} />
                ) : (
                  <>
                    <ArrowsClockwise size={16} color={colors.primary} />
                    <Text style={styles.updatePricesText}>Fiyatları Güncelle</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ing, idx) => (
                <IngredientRow
                  key={ing.ingredientId}
                  ingredient={ing}
                  calcState={recipe.source === 'TheMealDB' ? calc.ingredients[idx] : undefined}
                  onPress={() => router.push({
                    pathname: `/(tabs)/recipes/my-ingredients/${ing.ingredientId}`,
                    params: {
                      recipeId: recipe.id,
                      amount: ing.amount,
                      unit: ing.unit,
                      grams: ing.grams,
                    }
                  })}
                />
              ))}
            </View>
          </View>

          {/* Price History Section */}
          <View style={styles.section}>
            <PriceHistory
              history={[
                { date: new Date().toISOString(), price: recipe.totalCost }
              ]}
            />

          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={toggleInstructions}
              activeOpacity={0.7}
            >
              <View style={styles.row}>
                <BookOpen size={20} color={colors.primary} weight="bold" />
                <Text style={styles.sectionTitle}>Hazırlanış</Text>
              </View>
              {isInstructionsExpanded ? (
                <CaretUp size={18} color={colors.textSecondary} />
              ) : (
                <CaretDown size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>

            {isInstructionsExpanded && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                  {recipe.instructions || 'Bu tarif için henüz hazırlama talimatı eklenmemiş.'}
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          label="Düzenle"
          variant="outline"
          style={styles.editBtn}
          leftIcon={<PencilSimple size={20} color={colors.primary} weight="bold" />}
          onPress={() => router.push(`/(tabs)/recipes/new?id=${recipe.id}`)}
        />
        <Button
          label="Günlüğe Ekle"
          style={styles.addBtn}
          leftIcon={<Plus size={20} color="white" weight="bold" />}
          onPress={async () => {
             const calories = shouldCalculate ? (calc.totalCalories || 0) : recipe.totalCalories;
             const cost = shouldCalculate ? (calc.totalCost || 0) : recipe.totalCost;
             
             const mealId = await addMeal({
               type: MealType.LUNCH,
               recipeId: recipe.id,
               name: recipe.name,
               imageUrl: recipe.imageUrl,
               amount: 1,
               unit: 'porsiyon',
               grams: recipe.ingredients.reduce((acc, i) => acc + (i.grams || 0), 0),
               calories,
               cost,
               macros: {
                 protein: recipe.macros.protein,
                 carbs: recipe.macros.carbs,
                 fat: recipe.macros.fat
               }
             });
             
             if (mealId) setAddedMealId(mealId);

             Alert.alert('Başarılı', 'Öğün günlüğe eklendi.');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  updatePricesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight + '20',
  },
  updatePricesText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 12,
    color: colors.primary,
  },
  ingredientsList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instructionsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  instructionsText: {
    fontFamily: typography.fontRegular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.md,
    ...shadow.lg,
  },
  editBtn: {
    flex: 1,
  },
  addBtn: {
    flex: 2,
  },
});
