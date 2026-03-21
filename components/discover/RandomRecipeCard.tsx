import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Image, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS, 
  interpolate,
  withSequence,
  withSpring
} from 'react-native-reanimated';
import { ArrowClockwise, ChefHat } from 'phosphor-react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface RandomRecipeCardProps {
  name: string;
  image: string;
  calories: number;
  onRefresh: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}

export const RandomRecipeCard: React.FC<RandomRecipeCardProps> = ({
  name,
  image,
  calories,
  onRefresh,
  onPress,
  style,
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const rotation = useSharedValue(0);

  const rotate = () => {
    if (isRotating) return;
    setIsRotating(true);
    
    rotation.value = withTiming(360, { duration: 600 }, (finished) => {
      if (finished) {
        rotation.value = 0;
        runOnJS(setIsRotating)(false);
        runOnJS(onRefresh)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateY: `${rotation.value}deg` },
        { scale: interpolate(rotation.value, [0, 180, 360], [1, 0.9, 1]) }
      ],
    };
  });

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Card onPress={onPress} style={styles.card}>
          <View style={styles.row}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.content}>
              <View style={styles.header}>
                <ChefHat size={16} color={colors.accent} weight="fill" />
                <Text style={styles.headerText}>GÜNÜN ÖNERİSİ</Text>
              </View>
              <Text style={styles.name} numberOfLines={2}>{name}</Text>
              <Text style={styles.calories}>{calories} kcal</Text>
            </View>
          </View>
        </Card>
      </Animated.View>
      
      <Button
        onPress={rotate}
        label="Başka öneri?"
        variant="ghost"
        style={styles.refreshButton}
        textStyle={styles.refreshButtonText}
        leftIcon={<ArrowClockwise size={18} color={colors.accent} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.sm,
  },
  container: {
    backfaceVisibility: 'hidden',
  },
  card: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.accentLight,
    borderWidth: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    paddingLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerText: {
    fontFamily: typography.fontBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.accentDark,
    marginLeft: 4,
  },
  name: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 2,
  },
  calories: {
    fontFamily: typography.fontSemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  refreshButton: {
    alignSelf: 'center',
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  refreshButtonText: {
    color: colors.accentDark,
    fontSize: 13,
    fontFamily: typography.fontSemiBold,
  },
});
