import React, { useState, useEffect, useMemo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useTranslate } from '@/hooks/useTranslate';
import { useNutrition } from '@/hooks/useNutrition';
import { getRecipeById } from '@/services/themealdb';
import { searchMigrosProducts } from '@/services/migros';
import { extractIngredientName } from '@/utils/formatters';
import { parseMeasure, toGrams, parseProductGrams } from '@/utils/unitConverter';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { RecipeDetailHeader } from '@/components/recipes/RecipeDetailHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const scoreMigrosMatch = (product: any, query: string, unit: string, amount: number) => {
  let score = 0;
  const productName = product.name.toLowerCase();
  const q = query.toLowerCase();

  // 1. İsim Benzerliği
  if (productName === q) score += 100;
  else if (productName.includes(q)) score += 50;

  // 2. Birim Uyumu
  const targetUnitLower = (unit || '').toLowerCase();
  if (targetUnitLower === 'gram' || targetUnitLower === 'gr' || targetUnitLower === 'kg') {
    if (productName.includes(' g') || productName.includes(' gr') || productName.includes('kg')) {
      score += 30;
    }
  } else if (targetUnitLower === 'adet' || targetUnitLower === 'tane') {
    if (productName.includes(' adet') || productName.includes(' tane')) {
      score += 30;
    }
  }

  // 3. Kelime bazlı eşleşme
  const keywords = q.split(' ');
  keywords.forEach(kw => {
    if (kw.length > 2 && productName.includes(kw)) score += 20;
  });

  return score;
};

export default function DiscoverRecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addRecipe, addIngredient, ingredients: allIngredients } = useRecipesStore();
  const { translate, translateLongText } = useTranslate();
  const { getNutrition } = useNutrition();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(true);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const calculateRecipePreview = async (ingredients: any[]) => {
    let totalCalories = 0, totalCost = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    const ingredientList: any[] = [];

    for (const raw of ingredients) {
      try {
        const nameTr = await translate(raw.nameEn);
        const nameToSearch = (nameTr || raw.nameEn).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const { amount, unit } = parseMeasure(raw.measure);
        const migrosMatches = await searchMigrosProducts(nameToSearch);
        
        const scored = migrosMatches
          .map(p => ({ product: p, score: scoreMigrosMatch(p, nameToSearch, unit, amount) }))
          .sort((a, b) => b.score - a.score);
        
        const bestMatch = scored.length > 0 && scored[0].score > 0 ? scored[0].product : undefined;

        const nutrition = await getNutrition([
          extractIngredientName(bestMatch?.name || nameToSearch),
          bestMatch?.category || '',
          bestMatch?.topCategory || ''
        ]);

        const productGrams = bestMatch ? parseProductGrams(bestMatch.name) : undefined;
        const isKgProduct = bestMatch?.name?.toLowerCase().includes(' kg');
        const gramsCount = toGrams(amount, unit, bestMatch?.name || nameToSearch, isKgProduct ? undefined : productGrams);
        console.log(`[Preview] ${raw.nameEn} → ${nameToSearch} | bestMatch: ${bestMatch?.name} | grams: ${gramsCount} | cal: ${nutrition?.calories}`);

        const ratio = gramsCount / 100;
        totalCalories += (nutrition?.calories || 0) * ratio;
        totalProtein += (nutrition?.protein || 0) * (nutrition?.protein ? ratio : 0);
        totalCarbs += (nutrition?.carbs || 0) * (nutrition?.carbs ? ratio : 0);
        totalFat += (nutrition?.fat || 0) * (nutrition?.fat ? ratio : 0);
        totalCost += (bestMatch?.price || 0) * (gramsCount / 100);

        ingredientList.push({
          nameTr: nameToSearch,
          measure: raw.measure,
          grams: gramsCount,
        });
      } catch (e) {
        console.warn('Error calculating preview for ingredient:', raw.nameEn, e);
      }
    }

    return {
      totalCalories,
      totalCost,
      macros: { protein: totalProtein, carbs: totalCarbs, fat: totalFat },
      translatedIngredients: ingredientList
    };
  };

  const fetchRecipe = async () => {
    setLoading(true);
    try {
      const data = await getRecipeById(id as string);
      if (data) {
        // Translate title and instructions for display
        const [nameTr, instructionsTr] = await Promise.all([
          translate(data.name),
          translateLongText(data.instructions)
        ]);

        const calculated = await calculateRecipePreview(data.ingredients);

        setRecipe({
          ...data,
          nameTr: nameTr || data.name,
          instructionsTr: instructionsTr || data.instructions,
          totalCalories: calculated.totalCalories,
          totalCost: calculated.totalCost,
          macros: calculated.macros,
          translatedIngredients: calculated.translatedIngredients,
          servings: 4
        });
      }
    } catch (error) {
      console.error('Fetch recipe error:', error);
      Alert.alert('Hata', 'Tarif bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMyRecipes = async () => {
    if (!recipe) return;
    setProcessing(true);
    try {
      const draftingIngredients = [];
      let totalCalories = 0;
      let totalCost = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      for (const raw of recipe.ingredients) {
        const nameTr = await translate(raw.nameEn);
        const nameToSearch = (nameTr || raw.nameEn).trim();
        const { amount, unit } = parseMeasure(raw.measure);
        
        const migrosMatches = await searchMigrosProducts(nameToSearch);
        const scored = migrosMatches
          .map(p => ({ product: p, score: scoreMigrosMatch(p, nameToSearch, unit, amount) }))
          .sort((a, b) => b.score - a.score);
        const bestMatch = scored.length > 0 && scored[0].score > 0 ? scored[0].product : undefined;

        const nutrition = await getNutrition([
          extractIngredientName(bestMatch?.name || nameToSearch),
          bestMatch?.category || '',
          bestMatch?.topCategory || ''
        ]);

        const ingId = bestMatch?.id || Math.random().toString(36).substr(2, 9);

        // Add to master ingredients if new
        await addIngredient({
          id: ingId,
          name: bestMatch?.name || nameToSearch,
          imageUrl: bestMatch?.imageUrl || undefined,
          migrosProductId: bestMatch?.id,
          lastKnownPrice: bestMatch?.price || 0,
          nutrition: {
            calories: nutrition?.calories || 0,
            protein: nutrition?.protein || 0,
            carbs: nutrition?.carbs || 0,
            fat: nutrition?.fat || 0,
            servingSize: 100,
            unit: 'g'
          },
          priceSyncDate: new Date(),
          custom: false
        });

        const productGrams = bestMatch ? parseProductGrams(bestMatch.name) : undefined;
        const gramsCount = toGrams(amount, unit, bestMatch?.name || nameToSearch, productGrams);

        const ratio = gramsCount / 100;
        totalCalories += (nutrition?.calories || 0) * ratio;
        totalProtein += (nutrition?.protein || 0) * (nutrition?.protein ? ratio : 0);
        totalCarbs += (nutrition?.carbs || 0) * (nutrition?.carbs ? ratio : 0);
        totalFat += (nutrition?.fat || 0) * (nutrition?.fat ? ratio : 0);
        totalCost += (bestMatch?.price || 0) * (gramsCount / 100);

        draftingIngredients.push({
          id: Math.random().toString(36).substr(2, 9),
          recipeId: recipe.id,
          ingredientId: ingId,
          name: bestMatch?.name || nameToSearch,
          amount,
          unit,
          grams: gramsCount,
        });
      }

      await addRecipe({
        id: recipe.id,
        name: recipe.nameTr,
        imageUrl: recipe.imageUrl,
        servings: 4,
        ingredients: draftingIngredients,
        instructions: recipe.instructionsTr,
        source: 'TheMealDB',
        totalCalories,
        totalCost,
        macros: {
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat
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

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Tarif hazırlanıyor...</Text>
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

        <RecipeDetailHeader recipe={{
          ...recipe,
          id: recipe.id,
          name: recipe.nameTr,
          imageUrl: recipe.imageUrl,
          isFavorite: false,
          cuisine: recipe.cuisine,
          source: 'TheMealDB'
        }} />

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
              {recipe.ingredients.map((ing: any, idx: number) => (
                <View key={idx} style={styles.ingredientItem}>
                  <Text style={styles.ingName}>
                    {recipe.translatedIngredients?.[idx]?.nameTr || ing.nameEn}
                  </Text>
                  <Text style={styles.ingMeasure}>{ing.measure}</Text>
                </View>
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
                <Text style={styles.instructionsText}>{recipe.instructionsTr}</Text>
              </View>
            )}
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.bottomBar}>
        <Button
          label="Tariflerime Ekle"
          style={styles.addRecipeBtn}
          loading={processing}
          disabled={processing}
          leftIcon={<Plus size={20} color="white" weight="bold" />}
          onPress={handleAddToMyRecipes}
        />
        <Button
          label="Günlüğe Ekle"
          variant="outline"
          style={styles.addLogBtn}
          disabled={processing}
          leftIcon={<CalendarPlus size={20} color={colors.primary} weight="bold" />}
          onPress={() => Alert.alert('İpucu', 'Bu tarifi günlüğe eklemek için önce tariflerinize kaydetmelisiniz.')}
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
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  ingName: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  ingMeasure: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.primary,
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
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'column',
    gap: spacing.sm,
    ...shadow.lg,
  },
  addRecipeBtn: {
    width: '100%',
  },
  addLogBtn: {
    width: '100%',
  },
});
