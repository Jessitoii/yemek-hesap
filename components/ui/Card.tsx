import { 
  StyleSheet, 
  View, 
  Pressable, 
  ViewStyle 
} from 'react-native';
import { ReactNode } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { radius, shadow } from '../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
}) => {
  const isPressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isPressed.value === 1 ? 0.98 : 1) }],
    };
  });

  const handlePressIn = () => {
    if (onPress) isPressed.value = 1;
  };

  const handlePressOut = () => {
    if (onPress) isPressed.value = 0;
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.card, shadow.sm, style, animatedStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[styles.card, shadow.sm, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    overflow: 'hidden',
  },
});
