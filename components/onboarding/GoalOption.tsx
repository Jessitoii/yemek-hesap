import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface GoalOptionProps {
  label: string;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
}

export const GoalOption: React.FC<GoalOptionProps> = ({ 
  label, 
  emoji, 
  isSelected, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        isSelected && styles.containerSelected
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[
        styles.label,
        isSelected && styles.labelSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  containerSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20', // Approx 12.5% opacity
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  label: {
    fontFamily: typography.fontMedium,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  labelSelected: {
    fontFamily: typography.fontBold,
    color: colors.primaryDark,
  },
});
