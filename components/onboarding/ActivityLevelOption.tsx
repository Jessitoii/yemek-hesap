import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { CheckCircle } from 'phosphor-react-native';

interface ActivityLevelOptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
}

export const ActivityLevelOption: React.FC<ActivityLevelOptionProps> = ({
  title,
  description,
  icon,
  isSelected,
  onPress
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        isSelected && styles.containerSelected
      ]}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isSelected && styles.titleSelected]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
          <CheckCircle size={24} color={colors.primary} weight="fill" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  containerSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10', 
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: typography.md,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  titleSelected: {
    color: colors.primaryDark,
  },
  description: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    marginLeft: 8,
  },
});
