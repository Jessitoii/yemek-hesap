import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface Macro {
  current: number;
  target: number;
}

interface MacroSummaryProps {
  protein: Macro;
  carbs: Macro;
  fat: Macro;
}

export const MacroSummary: React.FC<MacroSummaryProps> = ({ protein, carbs, fat }) => {
  const getPercentage = (m: Macro) => (m.target > 0 ? m.current / m.target : 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Makro Dağılımı</Text>
      
      <View style={styles.content}>
        <ProgressBar
          label={`Protein: ${Math.round(protein.current)}g / ${Math.round(protein.target)}g`}
          value={getPercentage(protein)}
          color={colors.primary}
          style={styles.bar}
        />

        <ProgressBar
          label={`Karbonhidrat: ${Math.round(carbs.current)}g / ${Math.round(carbs.target)}g`}
          value={getPercentage(carbs)}
          color={colors.accent}
          style={styles.bar}
        />

        <ProgressBar
          label={`Yağ: ${Math.round(fat.current)}g / ${Math.round(fat.target)}g`}
          value={getPercentage(fat)}
          color={colors.pink}
          style={styles.bar}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  bar: {
    marginVertical: 4,
  },
});
