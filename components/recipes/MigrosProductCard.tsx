import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { MigrosProduct } from '@/types/ingredient';
import { Button } from '@/components/ui/Button';

interface MigrosProductCardProps {
  product: MigrosProduct;
  onSelect: (product: MigrosProduct) => void;
}

export function MigrosProductCard({ product, onSelect }: MigrosProductCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand || 'Migros'}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₺{product.price.toFixed(2)}</Text>
          {product.pricePerUnit && (
            <Text style={styles.pricePerUnit}>
              ₺{product.pricePerUnit.toFixed(2)} / {product.unitType || 'kg'}
            </Text>
          )}
        </View>

        <Button
          label="Seç"
          onPress={() => onSelect(product)}
          variant="outline"
          style={styles.selectBtn}
          textStyle={styles.selectBtnText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: radius.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  brand: {
    fontFamily: typography.fontBold,
    fontSize: 10,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  price: {
    fontFamily: typography.fontExtraBold,
    fontSize: 16,
    color: colors.secondaryDark,
  },
  pricePerUnit: {
    fontFamily: typography.fontMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  selectBtn: {
    marginTop: 4,
    height: 32,
    paddingVertical: 0,
    alignSelf: 'flex-start',
    borderColor: colors.primary,
  },
  selectBtnText: {
    fontSize: 12,
    color: colors.primary,
  },
});
