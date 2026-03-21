import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { RecipeIngredient } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useRecipesStore } from '@/stores/recipesStore';

interface IngredientRowProps {
  ingredient: RecipeIngredient;
  onPress?: () => void;
}

export function IngredientRow({ ingredient, onPress }: IngredientRowProps) {
  // Find full ingredient data from store
  const allIngredients = useRecipesStore((state) => state.ingredients);
  const detail = allIngredients.find(i => i.id === ingredient.ingredientId);

  // Calculate calories and cost for the specific amount
  // nutrition: calories per 100g (usually)
  const calories = detail 
    ? Math.round((detail.nutrition.calories * ingredient.grams) / 100) 
    : 0;
  
  const cost = detail && detail.lastKnownPrice 
    ? ((detail.lastKnownPrice * ingredient.grams) / (detail.nutrition.servingSize || 100)).toFixed(2)
    : '0.00';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageBox}>
        {detail?.imageUrl ? (
          <Image source={{ uri: detail.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
             <Text style={styles.noImageText}>?</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{ingredient.name || detail?.name}</Text>
        <Text style={styles.quantity}>
          {ingredient.amount} {ingredient.unit} ({ingredient.grams}g)
        </Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.calories}>{calories} kcal</Text>
        <Text style={styles.cost}>₺{cost}</Text>
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
});
