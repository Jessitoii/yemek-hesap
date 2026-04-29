import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CaretRight, ChefHat } from 'phosphor-react-native';
import { RecipeIngredient } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useRecipesStore } from '@/stores/recipesStore';
import { IngredientCalcState } from '@/hooks/useRecipeCalculation';
import { SkeletonRow } from '../ui/SkeletonRow';

interface IngredientRowProps {
  ingredient: RecipeIngredient | { name: string; amount: string; unit: string; grams: number };
  calcState?: IngredientCalcState;
  onPress?: () => void;
}

export function IngredientRow({ ingredient, calcState, onPress }: IngredientRowProps) {
  // Find full ingredient data from store
  const allIngredients = useRecipesStore((state) => state.ingredients);
  const detail = allIngredients.find(i => i.id === (ingredient as any).ingredientId);

  const isPending = calcState?.status === 'pending' || calcState?.status === 'calculating';
  
  // Use calcState values if available, otherwise fallback to store/ingredient props
  const name = calcState?.nameTr || calcState?.nameEn || (ingredient as any).name || detail?.name;
  const quantity = calcState 
    ? `${calcState.measure} ${calcState.grams ? `(${Math.round(calcState.grams)}g)` : ''}`
    : `${(ingredient as any).amount} ${(ingredient as any).unit} (${(ingredient as any).grams}g)`;

  const calories = calcState?.status === 'done'
    ? Math.round(calcState.calories || 0)
    : detail 
      ? Math.round((detail.nutrition.calories * (ingredient as any).grams) / 100) 
      : 0;
  
  const cost = calcState?.status === 'done'
    ? (calcState.costTL || 0).toFixed(2)
    : detail && detail.lastKnownPrice 
      ? ((detail.lastKnownPrice * (ingredient as any).grams) / (detail.nutrition.servingSize || 100)).toFixed(2)
      : '0.00';

  const imageUrl = calcState?.migrosProduct?.imageUrl || detail?.imageUrl;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageBox}>
        {isPending ? (
          <SkeletonRow width="100%" height="100%" />
        ) : imageUrl ? (
          <Image 
            source={{ uri: imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl }} 
            style={styles.image} 
          />
        ) : (
          <View style={[styles.image, styles.noImage]}>
             <ChefHat size={24} color={colors.textDisabled} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        {isPending ? (
          <>
            <SkeletonRow width="60%" height={16} style={{ marginBottom: 4 }} />
            <SkeletonRow width="40%" height={12} />
          </>
        ) : (
          <>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.quantity}>{quantity}</Text>
          </>
        )}
      </View>

      <View style={styles.stats}>
        {isPending ? (
          <>
            <SkeletonRow width={50} height={14} style={{ marginBottom: 4 }} />
            <SkeletonRow width={40} height={14} />
          </>
        ) : calcState?.requiresManualInput ? (
          <Text style={styles.manualInput}>Miktar girin</Text>
        ) : (
          <>
            <Text style={styles.calories}>{calories} kcal</Text>
            <Text style={styles.cost}>₺{cost}</Text>
          </>
        )}
      </View>

      {onPress && (
        <View style={styles.action}>
          <CaretRight size={16} color={colors.textDisabled} weight="bold" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
  },
  imageBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontFamily: typography.fontBold,
    color: colors.textDisabled,
    fontSize: 20,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontFamily: typography.fontBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  quantity: {
    fontFamily: typography.fontMedium,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stats: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  calories: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.accentDark,
  },
  cost: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.secondaryDark,
  },
  action: {
    marginLeft: 4,
  },
  manualInput: {
    fontFamily: typography.fontSemiBold,
    fontSize: 12,
    color: colors.primary,
    textAlign: 'right',
  },
});
