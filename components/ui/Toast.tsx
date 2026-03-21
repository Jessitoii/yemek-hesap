import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withDelay, 
  runOnJS 
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { radius, spacing, shadow } from '../../constants/theme';
import { typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  visible?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  visible = false,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(spacing.xxxl, { damping: 15 });
      
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    opacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(-100, { duration: 300 }, (finished) => {
      if (finished && onClose) {
        runOnJS(onClose)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      default:
        return colors.info;
    }
  };

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: getBackgroundColor() }, 
        shadow.md, 
        animatedStyle
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.base,
    color: colors.surface,
    textAlign: 'center',
  },
});
