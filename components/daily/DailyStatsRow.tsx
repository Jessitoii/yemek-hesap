import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Fire, Wallet, Footprints, Lightning } from 'phosphor-react-native'
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface StatItemProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color }) => (
  <View style={styles.statBox}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      {icon}
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

interface DailyStatsRowProps {
  calories: number;
  spending: number;
  steps: number;
  burned: number;
}

export const DailyStatsRow: React.FC<DailyStatsRowProps> = ({
  calories,
  spending,
  steps,
  burned,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StatItem
          icon={<Fire />}
          value={Math.round(calories)}
          label="kalori"
          color={colors.error}
        />
        <StatItem
          icon={<Wallet />}
          value={`₺${spending.toFixed(2)}`}
          label="harcama"
          color={colors.accent}
        />
        <StatItem
          icon={<Footprints />}
          value={steps}
          label="adım"
          color={colors.primary}
        />
        <StatItem
          icon={<Lightning />}
          value={Math.round(burned)}
          label="yakılan"
          color={colors.secondary}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  statBox: {
    width: 100,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    padding: spacing.xs,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  value: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'lowercase',
  },
});
