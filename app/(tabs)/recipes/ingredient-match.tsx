import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MagnifyingGlass,
  Check,
  Info
} from 'phosphor-react-native';

import { useTranslate } from '@/hooks/useTranslate';
import { useRecipesStore } from '@/stores/recipesStore';
import { useNutrition } from '@/hooks/useNutrition';
import { IngredientMatchList } from '@/components/recipes/IngredientMatchList';
import { QuantityInput } from '@/components/recipes/QuantityInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { MigrosProduct } from '@/types/ingredient';
import { extractIngredientName } from '@/utils/formatters';

export default function IngredientMatchScreen() {
  const router = useRouter();
  const { initialQuery = '', ingredientId } = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialQuery as string);
  const [selectedProduct, setSelectedProduct] = useState<MigrosProduct | null>(null);
  const [step, setStep] = useState<'search' | 'quantity'>('search');
  const [quantityData, setQuantityData] = useState({ amount: 100, unit: 'gram', grams: 100 });
  const { translate, isLoading: isTranslating } = useTranslate();
  const { getNutrition, isLoading: isNutritionLoading } = useNutrition();
  const { draftingIngredients, appendDraftingIngredient, addIngredient } = useRecipesStore();

  useEffect(() => {
    // If we have an initial query but it's likely English, try translating
    const handleInitialTranslate = async () => {
      if (initialQuery && /^[a-zA-Z\s]+$/.test(initialQuery as string)) {
        const tr = await translate(initialQuery as string);
        setSearchQuery(tr);
      }
    };
    handleInitialTranslate();
  }, [initialQuery]);

  const handleProductSelect = (product: MigrosProduct) => {
    setSelectedProduct(product);
    setStep('quantity');
  };

  const handleConfirm = async () => {
    if (selectedProduct) {
      // Fetch nutrition for this product using OpenFoodFacts/USDA fallback
      const nutrition = await getNutrition([
        extractIngredientName(selectedProduct.name),
        selectedProduct.category ?? '',
        selectedProduct.topCategory ?? '',
      ]);

      // First, ensure the ingredient is in the master ingredients table
      await addIngredient({
        id: selectedProduct.id,
        name: selectedProduct.name,
        imageUrl: selectedProduct.imageUrl,
        migrosProductId: selectedProduct.id,
        lastKnownPrice: selectedProduct.price,
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

      appendDraftingIngredient({
        id: Math.random().toString(36).substr(2, 9),
        recipeId: (ingredientId as string) || 'new',
        ingredientId: selectedProduct.id,
        name: selectedProduct.name,
        amount: quantityData.amount,
        unit: quantityData.unit,
        grams: quantityData.grams,
      });
      router.back();
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => step === 'quantity' ? setStep('search') : router.back()}>
        <ArrowLeft size={24} color={colors.textPrimary} weight="bold" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {step === 'search' ? 'Ürün Eşleştir' : 'Miktar Girin'}
      </Text>
      <View style={{ width: 24 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {step === 'search' ? (
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Ürün adı ara..."
              leftIcon={<MagnifyingGlass size={20} color={colors.textDisabled} />}
            />
          </View>

          <IngredientMatchList
            query={searchQuery}
            onSelect={handleProductSelect}
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.quantitySection}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.productSummary}>
              <Text style={styles.productName}>{selectedProduct?.name}</Text>
              <View style={styles.productPriceBadge}>
                <Text style={styles.productPrice}>₺{selectedProduct?.price.toFixed(2)}</Text>
              </View>
            </View>

            {selectedProduct && (
              <QuantityInput
                ingredientName={selectedProduct.name}
                nutrition={{
                  calories: 120, // Mock, should come from OpenFoodFacts or similar
                  protein: 5,
                  carbs: 20,
                  fat: 2,
                  servingSize: 100,
                  unit: 'g'
                }}
                pricePerUnit={selectedProduct.price} // Simplified
                onQuantityChange={(amount, unit, grams) => setQuantityData({ amount, unit, grams })}
              />
            )}

            <View style={styles.confirmBox}>
              <View style={styles.infoRow}>
                <Info size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  Bu malzeme tarifinize eklenirken kalori ve maliyet hesaplamalarında kullanılacaktır.
                </Text>
              </View>

              <Button
                label="Onayla ve Ekle"
                onPress={handleConfirm}
                fullWidth
                loading={isNutritionLoading}
                leftIcon={<Check size={20} color="white" weight="bold" />}
              />

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
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
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  searchSection: {
    flex: 1,
  },
  searchBar: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  quantitySection: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  productSummary: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  productName: {
    flex: 1,
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  productPriceBadge: {
    backgroundColor: colors.secondaryLight + '40',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  productPrice: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.secondaryDark,
  },
  confirmBox: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: typography.fontRegular,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
