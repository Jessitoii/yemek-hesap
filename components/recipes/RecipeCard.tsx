import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Flame, CreditCard } from 'phosphor-react-native';
import { Recipe } from '@/types/recipe';
import { FavoriteButton } from './FavoriteButton';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Card } from '@/components/ui/Card';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();
  
  const perServingCalories = recipe.totalCalories == null ? null : Math.round(recipe.totalCalories / recipe.servings);
  const perServingCost = recipe.totalCost == null ? null : (recipe.totalCost / recipe.servings).toFixed(2);

  const handlePress = () => {
    router.push(`/(tabs)/recipes/${recipe.id}`);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={handlePress}
      style={styles.container}
    >
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          {recipe.imageUrl ? (
            <Image 
              source={{ uri: recipe.imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>Görsel Yüklenemedi</Text>
            </View>
          )}
          <View style={styles.favoriteWrapper}>
            <FavoriteButton 
              recipeId={recipe.id} 
              isFavorite={recipe.isFavorite} 
              size={20}
            />
          </View>
          
          <View style={styles.servingsBadge}>
            <Users size={14} color={colors.textOnPrimary} weight="bold" />
            <Text style={styles.servingsText}>{recipe.servings} Porsiyon</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{recipe.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Flame size={18} color={colors.accentDark} weight="fill" />
              <View>
                <Text style={styles.statLabel}>Kalori</Text>
                <Text style={styles.statValue}>{perServingCalories == null ? '? kcal' : `${perServingCalories} kcal`}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.stat}>
              <CreditCard size={18} color={colors.secondaryDark} weight="fill" />
              <View>
                <Text style={styles.statLabel}>Maliyet</Text>
                <Text style={styles.statValue}>{perServingCost == null ? '₺?.??' : `₺${perServingCost}`}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: radius.xl,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
  },
  favoriteWrapper: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  servingsBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
  },
  servingsText: {
    color: colors.textOnPrimary,
    fontSize: 11,
    fontFamily: typography.fontBold,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: typography.fontSemiBold,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: typography.fontBold,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
  },
});
