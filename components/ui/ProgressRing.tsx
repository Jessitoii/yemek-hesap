import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  value: number; // 0 to 1+ (can go over 1)
  size?: number;
  strokeWidth?: number;
  color?: string;
  centerLabel?: string;
  style?: ViewStyle;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 120,
  strokeWidth = 12,
  color,
  centerLabel,
  style,
}) => {
  const progress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    progress.value = withTiming(value, { 
      duration: 1000, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    // Clamp at 1 for visual ring, handling over 1 by maybe continuing or just capping
    // Usually these rings cap at 100% physically but we can show it differently
    const clampedValue = Math.min(progress.value, 1);
    const strokeDashoffset = circumference * (1 - clampedValue);
    
    return {
      strokeDashoffset,
    };
  });

  const getRingColor = () => {
    if (color) return color;
    if (value >= 1.1) return colors.error; // Red if over 110%
    if (value >= 0.9) return colors.accent; // Orange if over 90%
    return colors.secondary; // Green default
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.borderLight}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getRingColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {centerLabel ? (
        <View style={styles.labelContainer}>
          <Text style={styles.centerLabel}>{centerLabel}</Text>
          <Text style={styles.percentage}>{Math.round(value * 100)}%</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: {
    fontFamily: typography.fontBold,
    fontSize: typography.xl,
    color: colors.textPrimary,
  },
  percentage: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});
