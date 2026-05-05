import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  UIManager,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Plus,
  ArrowLeft,
  BookOpen,
  CaretDown,
  CaretUp,
  BookmarkSimple,
  ChefHat,
  CalendarPlus
} from 'phosphor-react-native';

import { useRecipesStore } from '@/stores/recipesStore';
import { useDailyStore } from '@/stores/dailyStore';
import { translateToTurkish, translateLongText } from '@/services/mymemory';
import { getRecipeById } from '@/services/themealdb';
import { useRecipeCalculation } from '@/hooks/useRecipeCalculation';
import { Button } from '@/components/ui/Button';
import { MealType } from '@/types/daily';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { RecipeDetailHeader } from '@/components/recipes/RecipeDetailHeader';
import { IngredientRow } from '@/components/recipes/IngredientRow';
import { useNotifications } from '@/hooks/useNotifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DiscoverRecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addRecipe, addIngredient } = useRecipesStore();
  const { addMeal } = useDailyStore();
  const { triggerRecipeCalculatedNotification } = useNotifications();
  const insets = useSafeAreaInsets();

  const [isFetchingRecipe, setIsFetchingRecipe] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [nameTr, setNameTr] = useState<string>('');
  const [instructionsTr, setInstructionsTr] = useState<string>('');
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(true);
  const [addedMealId, setAddedMealId] = useState<string | null>(null);

  // Step 1: Fetch TheMealDB data (Layer 1 - Fast)
  useEffect(() => {
    async function fetchBase() {
      setIsFetchingRecipe(true);
      try {
        const data = await getRecipeById(id as string);
        if (data) {
          setRecipe(data);
          setNameTr(data.name); // Default to EN first
          setInstructionsTr(data.instructions); // Default to EN first
          
          // Layer 1.5: Translate main texts in background
          translateToTurkish(data.name).then(setNameTr);
          translateLongText(data.instructions).then(setInstructionsTr);
        }
      } catch (error) {
        console.error('Fetch recipe error:', error);
        Alert.alert('Hata', 'Tarif bilgileri yüklenemedi.');
      } finally {
        setIsFetchingRecipe(false);
      }
    }
    fetchBase();
  }, [id]);

  // Step 2: Background Calculation (Layer 2)
  const calc = useRecipeCalculation(
    recipe?.name || '',
    recipe?.ingredients || [],
    recipe?.id || ''
  );

  const handleAddToMyRecipes = async () => {
    if (!recipe) return;
    setProcessing(true);
    try {
      // Save all resolved ingredients to store
      const draftingIngredients = [];
      
      for (const [idx, ingState] of calc.ingredients.entries()) {
        const ingId = ingState.migrosProduct?.id || `tmdb-${Math.random().toString(36).substr(2, 9)}`;
        
        await addIngredient({
          id: ingId,
          name: ingState.nameTr || ingState.nameEn || 'Malzeme',
          imageUrl: ingState.migrosProduct?.imageUrl || undefined,
          migrosProductId: ingState.migrosProduct?.id,
          lastKnownPrice: ingState.migrosProduct?.price || 0,
          nutrition: {
            calories: ingState.calories != null && ingState.grams != null ? ingState.calories * (100 / ingState.grams) : 0,
            protein: ingState.protein != null && ingState.grams != null ? ingState.protein * (100 / ingState.grams) : 0,
            carbs: ingState.carbs != null && ingState.grams != null ? ingState.carbs * (100 / ingState.grams) : 0,
            fat: ingState.fat != null && ingState.grams != null ? ingState.fat * (100 / ingState.grams) : 0,
            servingSize: 100,
            unit: 'g'
          },
          priceSyncDate: new Date(),
          custom: false
        });

        draftingIngredients.push({
          id: `ri-${Math.random().toString(36).substr(2, 9)}`,
          recipeId: recipe.id,
          ingredientId: ingId,
          name: ingState.nameTr || ingState.nameEn || 'Malzeme',
          amount: ingState.amount || 0,
          unit: ingState.unit || '',
          grams: ingState.grams,
        });
      }

      await addRecipe({
        id: recipe.id,
        name: nameTr || recipe.name,
        imageUrl: recipe.imageUrl,
        servings: 4,
        ingredients: draftingIngredients,
        instructions: instructionsTr || recipe.instructions,
        source: 'TheMealDB',
        totalCalories: calc.totalCalories,
        totalCost: calc.totalCost,
        macros: {
          protein: calc.totalProtein,
          carbs: calc.totalCarbs,
          fat: calc.totalFat
        },
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      Alert.alert('Başarılı', 'Tarif başarıyla tariflerinize eklendi!', [
        { text: 'Tamam', onPress: () => router.push('/(tabs)/recipes') }
      ]);
    } catch (error) {
      console.error('Add recipe error:', error);
      Alert.alert('Hata', 'Tarif eklenirken bir sorun oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToLog = async () => {
    if (!recipe) return;
    
    if (calc.totalCalories == null || calc.totalCost == null) {
      Alert.alert('Eksik Bilgi', 'Bazı malzemeler eksik olduğu için bu tarif günlük kaydına eklenemiyor.');
      return;
    }

    try {
      const mealId = await addMeal({
        type: MealType.LUNCH,
        recipeId: recipe.id,
        name: nameTr || recipe.name,
        imageUrl: recipe.imageUrl,
        amount: 1,
        unit: 'porsiyon',
        grams: calc.ingredients.reduce((acc, i) => acc + (i.grams || 0), 0),
        calories: calc.totalCalories,
        cost: calc.totalCost,
        macros: {
          protein: calc.totalProtein ?? 0,
          carbs: calc.totalCarbs ?? 0,
          fat: calc.totalFat ?? 0
        }
      });

      if (mealId) setAddedMealId(mealId);

      Alert.alert('Başarılı', 'Öğün günlüğe eklendi. Tarif tam hesaplandığında değerler güncellenecektir.', [
        { text: 'Tamam' }
      ]);
      
      // Note: In a production app, we would register this meal ID to be updated 
      // when calc.isComplete becomes true, even if the user leaves the screen.
    } catch (error) {
      console.error('Add meal error:', error);
    }
  };

  // Sync meal data when calculation reaches 100%
  useEffect(() => {
    if (calc.isComplete && addedMealId) {
      const { updateMeal } = useDailyStore.getState();
      updateMeal(addedMealId, {
        calories: calc.totalCalories ?? 0,
        cost: calc.totalCost ?? 0,
        macros: {
          protein: calc.totalProtein ?? 0,
          carbs: calc.totalCarbs ?? 0,
          fat: calc.totalFat ?? 0
        }
      }).then(() => {
        setAddedMealId(null); // Update complete, clear local ref
      });
    }
  }, [calc.isComplete, addedMealId, calc.totalCalories, calc.totalCost, calc.totalProtein, calc.totalCarbs, calc.totalFat]);

  if (isFetchingRecipe) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Tarif yükleniyor...</Text>
      </View>
    );
  }

  if (!recipe) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="white" weight="bold" />
          </TouchableOpacity>
        </View>

        <RecipeDetailHeader 
          recipe={{
            ...recipe,
            id: recipe.id,
            name: nameTr || recipe.name,
            totalCalories: calc.totalCalories,
            totalCost: calc.totalCost,
            servings: 4,
            isFavorite: false,
            cuisine: recipe.cuisine,
            source: 'TheMealDB'
          }}
          isComplete={calc.isComplete}
          completedCount={calc.completedCount}
          totalCount={calc.totalCount}
        />

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <View style={styles.infoItem}>
              <ChefHat size={20} color={colors.accent} />
              <Text style={styles.infoValue}>{recipe.category}</Text>
              <Text style={styles.infoLabel}>Kategori</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <BookmarkSimple size={20} color={colors.primary} />
              <Text style={styles.infoValue}>{recipe.cuisine}</Text>
              <Text style={styles.infoLabel}>Mutfak</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            <View style={styles.ingredientList}>
              {calc.ingredients.map((ingState, idx) => (
                <IngredientRow 
                  key={`${idx}-${ingState.nameEn}`}
                  ingredient={{
                    name: ingState.nameTr || ingState.nameEn,
                    amount: ingState.amount?.toString() || '',
                    unit: ingState.unit || '',
                    grams: ingState.grams
                  }}
                  calcState={ingState}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
            >
              <View style={styles.row}>
                <BookOpen size={20} color={colors.primary} weight="bold" />
                <Text style={styles.sectionTitle}>Hazırlanış</Text>
              </View>
              {isInstructionsExpanded ? <CaretUp size={18} /> : <CaretDown size={18} />}
            </TouchableOpacity>

            {isInstructionsExpanded && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>{instructionsTr || recipe.instructions}</Text>
              </View>
            )}
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          label="Tariflerime Ekle"
          variant="outline"
          style={styles.addRecipeBtn}
          loading={processing}
          disabled={processing}
          leftIcon={<Plus size={20} color={colors.primary} weight="bold" />}
          onPress={handleAddToMyRecipes}
        />
        <Button
          label="Günlüğe Ekle"
          style={styles.addLogBtn}
          disabled={processing || isFetchingRecipe}
          leftIcon={<CalendarPlus size={20} color="white" weight="bold" />}
          onPress={handleAddToLog}
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
    gap: 12,
  },
  loadingText: {
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
  },
  headerNav: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    marginTop: -20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadow.sm,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
  },
  infoValue: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 4,
  },
  infoLabel: {
    fontFamily: typography.fontRegular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontExtraBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  ingredientList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: spacing.md,
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
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    gap: spacing.md,
    ...shadow.lg,
  },
  addRecipeBtn: {
    flex: 1,
  },
  addLogBtn: {
    flex: 1.2,
  },
});
