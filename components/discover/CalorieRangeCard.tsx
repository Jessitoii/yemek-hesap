import React from 'react';
import { StyleSheet, Text, ViewStyle, Pressable, View } from 'react-native';
import { Card } from '../ui/Card';
import { colors } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface CalorieRangeCardProps {
  label: string;
  emoji: string;
  color: string;
  backgroundColor: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CalorieRangeCard: React.FC<CalorieRangeCardProps> = ({
  label,
  emoji,
  color,
  backgroundColor,
  onPress,
  style,
}) => {
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor },
        pressed && styles.pressed,
        style,
        shadow.sm,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, { color }]}>{label}</Text>
        <Text style={[styles.unit, { color }]}>kcal</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 100,
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.xs,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    textAlign: 'center',
  },
  unit: {
    fontFamily: typography.fontRegular,
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: -2,
    opacity: 0.8,
  },
});
