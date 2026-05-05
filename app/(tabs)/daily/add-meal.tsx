import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  CaretLeft,
  MagnifyingGlass,
  Plus,
  CheckCircle,
  ChefHat,
  Basket,
  X
} from 'phosphor-react-native';

import { useDailyStore } from '@/stores/dailyStore';
import { useRecipesStore } from '@/stores/recipesStore';
import { useMigrosSearch } from '@/hooks/useMigrosSearch';
import { useNutrition } from '@/hooks/useNutrition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { MealType } from '@/types/daily';
import { Recipe } from '@/types/recipe';
import { MigrosProduct } from '@/types/ingredient';
import { toGrams, parseProductGrams } from '@/utils/unitConverter';
import { calcCostTL } from '@/utils/priceCalc';
import { extractIngredientName } from '@/utils/formatters';

type Tab = 'recipes' | 'search';

export default function AddMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addMeal } = useDailyStore();
  const { recipes, loadRecipes } = useRecipesStore();

  const initialType = (params.type as MealType) || MealType.BREAKFAST;
  const [mealType, setMealType] = useState<MealType>(initialType);
  const [activeTab, setActiveTab] = useState<Tab>('recipes');

  // Search state
  const { results: migrosResults, isLoading: isSearchLoading, query, setQuery } = useMigrosSearch();
  const { getNutrition, isLoading: isNutritionLoading } = useNutrition();

  // Selected item state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MigrosProduct | null>(null);
  const [productNutrition, setProductNutrition] = useState<{
    calories: number;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  } | null>(null);
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('gram');
  const [parsingWarning, setParsingWarning] = useState<string | null>(null);

  const units = ['gram', 'ml', 'adet', 'litre', 'yemek kaşığı', 'çay kaşığı', 'bardak', 'dilim', 'avuç'];

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    if (params.recipeId) {
      const found = recipes.find(r => r.id === params.recipeId);
      if (found) {
        setSelectedRecipe(found);
      }
    }
  }, [params.recipeId, recipes]);

  const handleProductSelect = async (product: MigrosProduct) => {
    setSelectedProduct(product);
    setSelectedRecipe(null);
    setAmount('100'); // Default 100g
    setUnit('gram');

    // Parse net grams from name
    const netGrams = parseProductGrams(product.name);
    if (netGrams == null) {
      setParsingWarning('Ambalaj miktarı otomatik okunamadı. Ürün gramajını onaylayınca maliyet hesaplanır.');
    } else {
      setParsingWarning(null);
    }

    // Fetch nutrition for this product
    const nutrition = await getNutrition([
      extractIngredientName(product.name),
      product.category ?? '',
      product.topCategory ?? '',
    ])
    setProductNutrition(nutrition);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setSelectedProduct(null);
    setAmount('1');
    setUnit('Porsiyon');
  };

  const calculatePreview = useMemo(() => {
    const numAmount = parseFloat(amount.replace(',', '.')) || 0;

    if (selectedRecipe) {
      return {
        calories: selectedRecipe.totalCalories == null ? null : selectedRecipe.totalCalories * (numAmount / selectedRecipe.servings),
        cost: selectedRecipe.totalCost == null ? null : selectedRecipe.totalCost * (numAmount / selectedRecipe.servings),
        grams: 0, // Not explicitly used for recipes here
      };
    }

    if (selectedProduct) {
      const productNetWeight = parseProductGrams(selectedProduct.name);
      const amountInGrams = toGrams(numAmount, unit, selectedProduct.name, productNetWeight);

      const calories = productNutrition
        && amountInGrams != null ? (productNutrition.calories / 100) * amountInGrams : null;
      const cost = calcCostTL(selectedProduct.price, productNetWeight, amountInGrams);

      return { calories, cost, grams: amountInGrams };
    }

    return { calories: null, cost: null, grams: null };
  }, [selectedRecipe, selectedProduct, productNutrition, amount, unit]);

  const handleAdd = async () => {
    const numAmount = parseFloat(amount.replace(',', '.')) || 1;

    if (selectedRecipe) {
      if (
        calculatePreview.calories == null
        || calculatePreview.cost == null
        || selectedRecipe.macros.protein == null
        || selectedRecipe.macros.carbs == null
        || selectedRecipe.macros.fat == null
      ) return;
      await addMeal({
        recipeId: selectedRecipe.id,
        name: selectedRecipe.name,
        imageUrl: selectedRecipe.imageUrl,
        type: mealType,
        amount: numAmount,
        unit: 'Porsiyon',
        grams: 0,
        calories: calculatePreview.calories,
        cost: calculatePreview.cost,
        macros: {
          protein: selectedRecipe.macros.protein * (numAmount / selectedRecipe.servings),
          carbs: selectedRecipe.macros.carbs * (numAmount / selectedRecipe.servings),
          fat: selectedRecipe.macros.fat * (numAmount / selectedRecipe.servings),
        }
      });
      router.back();
    } else if (selectedProduct) {
      const g = calculatePreview.grams;
      if (g == null || calculatePreview.calories == null || calculatePreview.cost == null) return;
      await addMeal({
        name: selectedProduct.name,
        imageUrl: selectedProduct.imageUrl || undefined,
        type: mealType,
        amount: numAmount,
        unit: unit,
        grams: g,
        calories: calculatePreview.calories,
        cost: calculatePreview.cost,
        macros: {
          protein: (productNutrition?.protein ?? 0) * (g / 100),
          carbs: (productNutrition?.carbs ?? 0) * (g / 100),
          fat: (productNutrition?.fat ?? 0) * (g / 100),
        }
      });
      router.back();
    }
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedRecipe?.id === item.id && styles.selectedItem
      ]}
      onPress={() => handleRecipeSelect(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.listImage} />
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.listSub}>
          {item.totalCalories == null ? '? kcal' : `${Math.round(item.totalCalories)} kcal`} | {item.totalCost == null ? '₺?.??' : `₺${item.totalCost.toFixed(2)}`}
        </Text>
      </View>
      {selectedRecipe?.id === item.id && (
        <CheckCircle size={24} color={colors.primary} weight="fill" />
      )}
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: MigrosProduct }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedProduct?.id === item.id && styles.selectedItem
      ]}
      onPress={() => handleProductSelect(item)}
    >
      <Image source={{ uri: item.imageUrl || undefined }} style={styles.listImage} />
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.listSub}>₺{item.price.toFixed(2)} | {item.brand}</Text>
      </View>
      {selectedProduct?.id === item.id && (
        <CheckCircle size={24} color={colors.primary} weight="fill" />
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <CaretLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Öğün Ekle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Öğün Tipi</Text>
          <View style={styles.typeRow}>
            {Object.values(MealType).map((type) => (
              <Chip
                key={type}
                label={type === MealType.BREAKFAST ? 'Kahvaltı' :
                  type === MealType.LUNCH ? 'Öğle' :
                    type === MealType.DINNER ? 'Akşam' : 'Atıştırmalık'}
                selected={mealType === type}
                onPress={() => setMealType(type)}
                variant={mealType === type ? 'primary' : 'outline'}
              />
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
            onPress={() => setActiveTab('recipes')}
          >
            <ChefHat size={20} color={activeTab === 'recipes' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>Tariflerim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Basket size={20} color={activeTab === 'search' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Yiyecek Ara</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'recipes' ? (
            <View>
              {recipes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Henüz tarifin yok.</Text>
                </View>
              ) : (
                recipes.map(recipe => (
                  <View key={recipe.id}>
                    {renderRecipeItem({ item: recipe })}
                  </View>
                ))
              )}
            </View>
          ) : (
            <View>
              <Input
                placeholder="Örn: Elma, Süzme Peynir..."
                value={query}
                onChangeText={setQuery}
                leftIcon={<MagnifyingGlass size={20} color={colors.textSecondary} />}
                style={styles.searchInput}
              />
              {isSearchLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
              ) : (
                migrosResults.map(product => (
                  <View key={product.id}>
                    {renderProductItem({ item: product })}
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Persistent Bottom Selection Area */}
      {(selectedRecipe || selectedProduct) && (
        <View style={styles.bottomSheet}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>
              {selectedRecipe?.name || selectedProduct?.name}
            </Text>
            <TouchableOpacity onPress={() => { setSelectedRecipe(null); setSelectedProduct(null); }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.amountRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Miktar</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                autoFocus={false}
              />
            </View>
            <View style={{ flex: 2, marginLeft: spacing.md }}>
              <Text style={styles.inputLabel}>Birim</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
                {(selectedRecipe ? ['Porsiyon'] : units).map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {parsingWarning && (
            <Text style={styles.warningText}>{parsingWarning}</Text>
          )}

          <View style={styles.previewStats}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{calculatePreview.calories != null ? `≈ ${Math.round(calculatePreview.calories)}` : '?'}</Text>
              <Text style={styles.statLabel}>kcal</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{calculatePreview.cost != null ? `≈ ₺${calculatePreview.cost.toFixed(2)}` : '₺?.??'}</Text>
              <Text style={styles.statLabel}>maliyet</Text>
            </View>
          </View>

          <Button
            label="Ekle"
            onPress={handleAdd}
            fullWidth
            loading={isNutritionLoading}
            disabled={calculatePreview.calories == null || calculatePreview.cost == null}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.md,
  },
  sectionLabel: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    padding: spacing.md,
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectedItem: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  listInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  listTitle: {
    fontFamily: typography.fontBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  listSub: {
    fontFamily: typography.fontMedium,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewTitle: {
    fontFamily: typography.fontBold,
    fontSize: 17,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontFamily: typography.fontBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  amountInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  unitSelector: {
    height: 48,
  },
  unitChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    marginRight: spacing.xs,
    height: 40,
  },
  unitChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitChipText: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  unitChipTextActive: {
    color: colors.textOnPrimary,
    fontFamily: typography.fontBold,
  },
  warningText: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stat: {
    alignItems: 'center',
  },
  statVal: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
