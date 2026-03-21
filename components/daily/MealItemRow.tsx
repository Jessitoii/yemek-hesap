import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Trash } from 'phosphor-react-native';
import { Meal } from '../../types/daily';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface MealItemRowProps {
  meal: Meal;
  onDelete: (id: string) => void;
}

export const MealItemRow: React.FC<MealItemRowProps> = ({ meal, onDelete }) => {
  return (
    <View style={styles.container}>
      {meal.imageUrl ? (
        <Image source={{ uri: meal.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>🍽️</Text>
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
        <Text style={styles.quantity}>{meal.amount} {meal.unit}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.calories}>{Math.round(meal.calories)} kcal</Text>
        <Text style={styles.cost}>₺{meal.cost.toFixed(2)}</Text>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onDelete(meal.id)}
        activeOpacity={0.7}
      >
        <Trash size={20} color={colors.error} weight="bold" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  placeholderContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  name: {
    fontFamily: typography.fontSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  quantity: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  calories: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  cost: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
