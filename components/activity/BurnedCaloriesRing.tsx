import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ProgressRing } from '../ui/ProgressRing';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

interface BurnedCaloriesRingProps {
  burned: number;
  goal: number;
  size?: number;
}

export const BurnedCaloriesRing: React.FC<BurnedCaloriesRingProps> = ({
  burned,
  goal,
  size = 200,
}) => {
  const progress = goal > 0 ? burned / goal : 0;

  return (
    <View style={styles.container}>
      <ProgressRing
        value={progress}
        size={size}
        strokeWidth={16}
        color={colors.pink}
        centerLabel={burned.toString()}
      />
      <Text style={styles.label}>Yakılan Kalori</Text>
      <Text style={styles.goalLabel}>Hedef: {goal} kcal</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: typography.lg,
    color: colors.textPrimary,
    marginTop: 12,
  },
  goalLabel: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
