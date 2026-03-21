import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, color }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, color ? { color } : null]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 20,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
  },
  unit: {
    fontSize: 12,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
