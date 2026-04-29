import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Share } from 'react-native';
import { CaretLeft, Users, Flame, CreditCard, ShareNetwork } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { FavoriteButton } from './FavoriteButton';
import { Badge } from '@/components/ui/Badge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonRow } from '@/components/ui/SkeletonRow';

interface RecipeDetailHeaderProps {
  recipe: {
    id: string;
    name: string;
    imageUrl?: string;
    cuisine?: string;
    source?: string;
    isFavorite: boolean;
    totalCalories: number | null;
    totalCost: number | null;
    servings: number;
  };
  isComplete?: boolean;
  completedCount?: number;
  totalCount?: number;
}

export function RecipeDetailHeader({ recipe, isComplete = true, completedCount = 0, totalCount = 0 }: RecipeDetailHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const perServingCalories = recipe.totalCalories ? Math.round(recipe.totalCalories / recipe.servings) : null;
  const perServingCost = recipe.totalCost ? (recipe.totalCost / recipe.servings).toFixed(2) : null;

  const handleShare = async () => {
    const calStr = recipe.totalCalories ? `${Math.round(recipe.totalCalories)} kcal` : '---';
    const costStr = recipe.totalCost ? `₺${recipe.totalCost.toFixed(2)}` : '---';
    await Share.share({
      message: `${recipe.name}\n\n🔥 ${calStr} | ${costStr}\n👥 ${recipe.servings} porsiyon\n\nKaloriTabak uygulamasından paylaşıldı.`,
      title: recipe.name,
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={styles.imageContainer}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={styles.noImageText}>Görsel Yok</Text>
          </View>
        )}
        <View style={styles.overlay} />
      </View>

      {/* Action Buttons */}
      <View style={[styles.navHeader, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <CaretLeft size={24} color={colors.textPrimary} weight="bold" />
        </Pressable>

        <View style={styles.headerActions}>
          <View style={styles.headerBtn}>
            <FavoriteButton
              recipeId={recipe.id}
              isFavorite={recipe.isFavorite}
              size={24}
            />
          </View>
          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <ShareNetwork size={24} color={colors.textPrimary} weight="bold" />
          </Pressable>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoContainer}>
        <View style={styles.tagRow}>
          {recipe.cuisine && <Badge label={recipe.cuisine} />}
          {recipe.source && <Badge label={recipe.source} />}
        </View>

        <Text style={styles.name}>{recipe.name}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Flame size={20} color={colors.accentDark} weight="fill" />
            <View>
              {recipe.totalCalories !== null ? (
                <Text style={styles.statVal}>{recipe.totalCalories.toFixed(0)} kcal</Text>
              ) : (
                <SkeletonRow width={60} height={14} style={{ marginVertical: 2 }} />
              )}
              <Text style={styles.statLabel}>Toplam Kalori</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <CreditCard size={20} color={colors.secondaryDark} weight="fill" />
            <View>
              {recipe.totalCost !== null ? (
                <Text style={styles.statVal}>₺{recipe.totalCost.toFixed(2)}</Text>
              ) : (
                <SkeletonRow width={60} height={14} style={{ marginVertical: 2 }} />
              )}
              <Text style={styles.statLabel}>Toplam Maliyet</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <Users size={20} color={colors.primaryDark} weight="fill" />
            <View>
              <Text style={styles.statVal}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>Porsiyon</Text>
            </View>
          </View>
        </View>

        {!isComplete && totalCount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tarif hesaplanıyor...</Text>
              <Text style={styles.progressText}>{completedCount}/{totalCount} malzeme</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${(completedCount / totalCount) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.perServingContainer}>
          {perServingCalories !== null && perServingCost !== null ? (
            <Text style={styles.perServingText}>
              Porsiyon başı ortalama <Text style={styles.bold}>{perServingCalories} kcal</Text> ve <Text style={styles.bold}>₺{perServingCost}</Text>
            </Text>
          ) : (
            <SkeletonRow width="80%" height={14} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.sm,
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontFamily: typography.fontBold,
    color: colors.textSecondary,
    fontSize: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  navHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    // To position FavoriteButton correctly
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.sm,
  },
  infoContainer: {
    marginTop: -radius.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  name: {
    fontFamily: typography.fontExtraBold,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statVal: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: typography.fontMedium,
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  perServingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  perServingText: {
    fontFamily: typography.fontRegular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bold: {
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: typography.fontSemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressText: {
    fontFamily: typography.fontBold,
    fontSize: 12,
    color: colors.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
