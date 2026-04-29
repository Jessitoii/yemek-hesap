import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  useAnimatedStyle, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/theme';

interface SkeletonRowProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonRow({ 
  width = '100%', 
  height = 16, 
  borderRadius = radius.sm, 
  style 
}: SkeletonRowProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        { width: width as any, height: height as any, borderRadius }, 
        style, 
        animatedStyle
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.borderLight,
  },
});
