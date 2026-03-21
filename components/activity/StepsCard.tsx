import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StepsCardProps {
  steps: number;
  goal: number;
  source?: 'Health' | 'Pedometer' | 'Manuel';
}

export const StepsCard: React.FC<StepsCardProps> = ({
  steps,
  goal,
  source = 'Health',
}) => {
  const remaining = Math.max(0, goal - steps);
  const progress = goal > 0 ? steps / goal : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="walk" size={24} color={colors.primary} />
          <Text style={styles.title}>Adımlar</Text>
        </View>
        <Text style={styles.source}>{source}</Text>
      </View>

      <Text style={styles.stepsText}>{steps.toLocaleString()}</Text>
      
      <ProgressBar 
        value={progress} 
        color={colors.primary} 
        style={styles.progressBar}
      />

      <View style={styles.footer}>
        <Text style={styles.goalText}>Hedef: {goal.toLocaleString()}</Text>
        <Text style={styles.remainingText}>
          {remaining > 0 ? `${remaining.toLocaleString()} adım kaldı` : 'Hedefe ulaşıldı! 🎉'}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: typography.base,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  source: {
    fontFamily: typography.fontRegular,
    fontSize: typography.xs,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stepsText: {
    fontFamily: typography.fontBold,
    fontSize: typography.xxxl,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  progressBar: {
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  remainingText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.xs,
    color: colors.primaryDark,
  },
});
