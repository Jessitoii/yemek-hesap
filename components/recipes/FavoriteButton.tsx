import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
} from 'react-native-reanimated';
import { Heart } from 'phosphor-react-native';
import { useRecipesStore } from '@/stores/recipesStore';
import { colors } from '@/constants/colors';
import { shadow, radius } from '@/constants/theme';

interface FavoriteButtonProps {
  recipeId: string;
  isFavorite: boolean;
  size?: number;
}

const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export function FavoriteButton({ recipeId, isFavorite, size = 24 }: FavoriteButtonProps) {
  const toggleFavorite = useRecipesStore((state) => state.toggleFavorite);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = async () => {
    // Spring animation
    scale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    
    await toggleFavorite(recipeId);
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, shadow.sm]}>
      <AnimatedHeart
        size={size}
        color={isFavorite ? colors.error : colors.textSecondary}
        weight={isFavorite ? "fill" : "bold"}
        style={animatedStyle}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
