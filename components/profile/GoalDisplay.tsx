import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { UserGoals, GoalType } from '@/types/user';
import { Chip } from '@/components/ui/Chip';
import { SimpleLineIcons } from '@expo/vector-icons';

interface GoalDisplayProps {
  goals: UserGoals;
  onEditPress: () => void;
}

const getGoalLabel = (type: GoalType) => {
  switch (type) {
    case GoalType.LOSE_WEIGHT: return 'Kilo Ver';
    case GoalType.GAIN_WEIGHT: return 'Kilo Al';
    case GoalType.STAY_FIT: return 'Formda Kal';
    case GoalType.EAT_HEALTHIER: return 'Sağlıklı Beslen';
    case GoalType.REDUCE_SPENDING: return 'Mali Tasarruf';
    default: return type;
  }
};

export const GoalDisplay: React.FC<GoalDisplayProps> = ({ goals, onEditPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.types}>
          {goals.goalType.map((type, index) => (
            <Chip 
              key={index} 
              label={getGoalLabel(type)} 
              variant="outline" 
              onPress={() => {}}
              style={styles.chip}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <SimpleLineIcons name="pencil" size={14} color={colors.primary} />
          <Text style={styles.editButtonText}>Hedefi Değiştir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Kalori</Text>
          <Text style={[styles.statValue, { color: colors.calorieUnder }]}>{goals.dailyCalorieTarget}</Text>
          <Text style={styles.statUnit}>kcal</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Protein</Text>
          <Text style={styles.statValue}>{goals.macroTarget.protein}</Text>
          <Text style={styles.statUnit}>g</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Karh.</Text>
          <Text style={styles.statValue}>{goals.macroTarget.carbs}</Text>
          <Text style={styles.statUnit}>g</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Yağ</Text>
          <Text style={styles.statValue}>{goals.macroTarget.fat}</Text>
          <Text style={styles.statUnit}>g</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Bütçe</Text>
          <Text style={[styles.statValue, { color: colors.accent }]}>{goals.dailyBudget}</Text>
          <Text style={styles.statUnit}>₺</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryLight + '20',
  },
  editButtonText: {
    fontSize: 12,
    fontFamily: typography.fontSemiBold,
    color: colors.primary,
    marginLeft: 6,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
  },
  statUnit: {
    fontSize: 10,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
});
