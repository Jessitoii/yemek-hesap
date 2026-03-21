import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
// Apple yerine Orange kullan
import { CaretDown, CaretUp, PlusCircle, Coffee, Hamburger, ForkKnife, Orange } from 'phosphor-react-native'
import { Meal, MealType } from '../../types/daily';
import { MealItemRow } from './MealItemRow';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MealSectionProps {
  mealType: MealType;
  items: Meal[];
  onAddPress: () => void;
  onDeleteMeal: (id: string) => void;
}

const mealTypeConfig = {
  [MealType.BREAKFAST]: { title: 'Kahvaltı', icon: <Coffee size={20} color={colors.primary} weight="fill" /> },
  [MealType.LUNCH]: { title: 'Öğle Yemeği', icon: <Hamburger size={20} color={colors.primary} weight="fill" /> },
  [MealType.DINNER]: { title: 'Akşam Yemeği', icon: <ForkKnife size={20} color={colors.primary} weight="fill" /> },
  [MealType.SNACK]: { title: 'Atıştırmalık', icon: <Orange size={20} color={colors.primary} weight="fill" /> },
}

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  items,
  onAddPress,
  onDeleteMeal,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const config = mealTypeConfig[mealType];
  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '40' }]}>
            {config.icon}
          </View>
          <Text style={styles.title}>{config.title}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.subtotal}>{Math.round(totalCalories)} kcal</Text>
          {isOpen ? (
            <CaretUp size={16} color={colors.textSecondary} weight="bold" />
          ) : (
            <CaretDown size={16} color={colors.textSecondary} weight="bold" />
          )}
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.itemsList}>
          {items.map((item) => (
            <MealItemRow key={item.id} meal={item} onDelete={onDeleteMeal} />
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <PlusCircle size={24} color={colors.primary} weight="duotone" />
            <Text style={styles.addButtonText}>Ekle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: spacing.xs,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtotal: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  itemsList: {
    padding: spacing.sm,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.primary + '60',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  addButtonText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.primary,
  },
});
