import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Recipe } from '../../types/recipe';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface RecipeSuggestionCardProps {
  recipe: Recipe | null;
  isTargetExceeded: boolean;
  onAddPress: (recipe: Recipe) => void;
}

export const RecipeSuggestionCard: React.FC<RecipeSuggestionCardProps> = ({
  recipe,
  isTargetExceeded,
  onAddPress,
}) => {
  if (isTargetExceeded) {
    return (
      <Card style={styles.motivationCard}>
        <Avatar state="celebrate" size={80} />
        <View style={styles.motivationContent}>
          <Text style={styles.motivationTitle}>Harika İş!</Text>
          <Text style={styles.motivationText}>
            Günlük kalori hedefine ulaştın. Bugünlük bu kadar yeterli!
          </Text>
        </View>
      </Card>
    );
  }

  if (!recipe) return null;

  const caloriesText = recipe.totalCalories == null ? '? kcal' : `${Math.round(recipe.totalCalories)} kcal`;
  const costText = recipe.totalCost == null ? '₺?.??' : `₺${recipe.totalCost.toFixed(2)}`;

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Günün Önerisi</Text>
      <View style={styles.content}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🥘</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.recipeName} numberOfLines={2}>
            {recipe.name}
          </Text>
          <Text style={styles.recipeStats}>
            {caloriesText} | {costText}
          </Text>
        </View>
      </View>
      <Button
        label="Günlüğe Ekle"
        onPress={() => onAddPress(recipe)}
        style={styles.addButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  recipeName: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  recipeStats: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    height: 40,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.secondaryLight + '20',
    borderColor: colors.secondaryLight,
  },
  motivationContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  motivationTitle: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.secondaryDark,
  },
  motivationText: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
