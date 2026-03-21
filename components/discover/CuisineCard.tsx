import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, spacing, shadow } from '../../constants/theme';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

interface CuisineCardProps {
  name: string;
  image: string;
  recipeCount: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CuisineCard: React.FC<CuisineCardProps> = ({
  name,
  image,
  recipeCount,
  onPress,
  style,
}) => {
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
        shadow.md,
      ]}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.count}>{recipeCount} Tarif</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  content: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
  },
  name: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.textOnPrimary,
  },
  count: {
    fontFamily: typography.fontRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
