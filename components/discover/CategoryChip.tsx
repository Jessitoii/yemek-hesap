import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle, View } from 'react-native';
import { colors } from '../../constants/colors';
import { radius, spacing, shadow } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface CategoryChipProps {
  label: string;
  emoji: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  emoji,
  selected = false,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        selected ? styles.containerActive : styles.containerInactive,
        style,
        selected && shadow.sm,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected ? styles.labelActive : styles.labelInactive]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  containerActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  containerInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: 14,
  },
  labelActive: {
    color: colors.textOnPrimary,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
