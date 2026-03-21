import React from 'react';
import { 
  StyleSheet, 
  Text, 
  Pressable, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  View
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'error';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
}) => {
  const isPressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isPressed.value === 1 ? 0.97 : 1) }],
      opacity: isPressed.value === 1 ? 0.9 : 1,
    };
  });

  const getBackgroundStyle = (): ViewStyle => {
    if (disabled) return { backgroundColor: colors.textDisabled };
    
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'error':
        return { backgroundColor: colors.error };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    if (disabled) return { color: colors.surface };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'error':
        return { color: colors.textOnPrimary };
      case 'outline':
      case 'ghost':
        return { color: colors.primary };
      default:
        return { color: colors.textOnPrimary };
    }
  };

  const handlePressIn = () => {
    if (!disabled && !loading) {
      isPressed.value = 1;
    }
  };

  const handlePressOut = () => {
    isPressed.value = 0;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        getBackgroundStyle(),
        fullWidth && styles.fullWidth,
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'ghost' || variant === 'outline' ? colors.primary : colors.textOnPrimary} 
          size="small" 
        />
      ) : (
        <View style={styles.content}>
           {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
           <Text style={[styles.label, getTextStyle(), textStyle]}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: 15,
    textAlign: 'center',
  },
});
