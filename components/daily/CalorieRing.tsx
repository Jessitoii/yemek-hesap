import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ProgressRing } from '../ui/ProgressRing';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/theme';

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({ consumed, target }) => {
  const percentage = target > 0 ? consumed / target : 0;
  
  const getRingColor = () => {
    if (percentage >= 1.0) return colors.calorieOver;
    if (percentage >= 0.9) return colors.calorieNear;
    return colors.calorieUnder;
  };

  return (
    <View style={styles.container}>
      <ProgressRing
        value={percentage}
        size={180}
        strokeWidth={15}
        color={getRingColor()}
      />
      <View style={styles.labelContainer}>
        <Text style={styles.consumedKcal}>{Math.round(consumed)}</Text>
        <Text style={styles.targetKcal}>/ {Math.round(target)} kcal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumedKcal: {
    fontFamily: typography.fontBold,
    fontSize: 32,
    color: colors.textPrimary,
  },
  targetKcal: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
});
