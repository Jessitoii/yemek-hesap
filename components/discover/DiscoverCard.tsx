import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { Heart } from 'phosphor-react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { colors } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface DiscoverCardProps {
  id: string;
  name: string;
  image: string;
  calories: number;
  cuisine: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export const DiscoverCard: React.FC<DiscoverCardProps> = ({
  name,
  image,
  calories,
  cuisine,
  isFavorite = false,
  onPress,
  onFavoritePress,
}) => {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <Pressable 
          style={styles.favoriteButton} 
          onPress={onFavoritePress}
          hitSlop={8}
        >
          <Heart 
            size={20} 
            color={isFavorite ? colors.error : colors.textOnPrimary} 
            weight={isFavorite ? "fill" : "bold"} 
          />
        </Pressable>
        <View style={styles.cuisineBadgeContainer}>
          <Badge label={cuisine} color="accent" style={styles.badge} />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.stats}>
          <Text style={styles.calories}>{calories} <Text style={styles.kcal}>kcal</Text></Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    width: 200,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: radius.full,
    padding: 6,
  },
  cuisineBadgeContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
  },
  badge: {
    opacity: 0.9,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calories: {
    fontFamily: typography.fontSemiBold,
    fontSize: 13,
    color: colors.primaryDark,
  },
  kcal: {
    fontFamily: typography.fontRegular,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
