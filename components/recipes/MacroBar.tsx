import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface Macro {
  label: string;
  value: number;
  color: string;
}

interface MacroBarProps {
  protein: number;
  carbs: number;
  fat: number;
  height?: number;
}

export function MacroBar({ protein, carbs, fat, height = 8 }: MacroBarProps) {
  const total = protein + carbs + fat;
  const pWidth = useSharedValue(0);
  const cWidth = useSharedValue(0);
  const fWidth = useSharedValue(0);

  useEffect(() => {
    if (total > 0) {
      pWidth.value = withTiming((protein / total) * 100, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      cWidth.value = withTiming((carbs / total) * 100, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      fWidth.value = withTiming((fat / total) * 100, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [protein, carbs, fat, total]);

  const pStyle = useAnimatedStyle(() => ({
    width: `${pWidth.value}%`,
    backgroundColor: colors.primary,
  }));

  const cStyle = useAnimatedStyle(() => ({
    width: `${cWidth.value}%`,
    backgroundColor: colors.accent,
  }));

  const fStyle = useAnimatedStyle(() => ({
    width: `${fWidth.value}%`,
    backgroundColor: colors.pink,
  }));

  const macros: Macro[] = [
    { label: 'Protein', value: Math.round(protein), color: colors.primary },
    { label: 'Karb', value: Math.round(carbs), color: colors.accent },
    { label: 'Yağ', value: Math.round(fat), color: colors.pink },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.barContainer, { height }]}>
        <Animated.View style={[styles.bar, pStyle]} />
        <Animated.View style={[styles.bar, cStyle]} />
        <Animated.View style={[styles.bar, fStyle]} />
      </View>
      <View style={styles.labelContainer}>
        {macros.map((macro, index) => (
          <View key={index} style={styles.macroLabel}>
            <View style={[styles.dot, { backgroundColor: macro.color }]} />
            <Text style={styles.labelValue}>{macro.value}g {macro.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  barContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  bar: {
    height: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  macroLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  labelValue: {
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
