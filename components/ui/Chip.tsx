import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'outline',
  style,
}) => {
  const getContainerStyle = (): ViewStyle => {
    if (selected || variant === 'primary') {
      return { 
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
        borderWidth: 1,
      };
    }
    if (variant === 'ghost') {
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
    }
    return { 
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    if (selected || variant === 'primary') {
      return { color: colors.primaryDark };
    }
    return { color: colors.textSecondary };
  };


  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, getContainerStyle(), style]}
    >
      <Text style={[styles.label, getTextStyle()]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sm,
  },
});
