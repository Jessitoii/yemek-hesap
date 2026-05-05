import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Input } from '@/components/ui/Input';
import { toGrams, UnitType } from '@/utils/unitConverter';
import { NutritionData } from '@/types/ingredient';
import { Card } from '@/components/ui/Card';

interface QuantityInputProps {
  ingredientName: string;
  nutrition: NutritionData;
  initialAmount?: string;
  initialUnit?: string;
  onQuantityChange: (amount: number, unit: string, grams: number | null) => void;
  pricePerUnit?: number; // Price per servingSize (usually 100g)
}

const UNITS: { label: string; value: UnitType }[] = [
  { label: 'Gram', value: 'gram' },
  { label: 'Adet', value: 'adet' },
  { label: 'Yemek K.', value: 'yemek kaşığı' },
  { label: 'Çay K.', value: 'çay kaşığı' },
  { label: 'Bardak', value: 'bardak' },
  { label: 'ML', value: 'ml' },
  { label: 'Dilim', value: 'dilim' },
  { label: 'Avuç', value: 'avuç' },
];

export function QuantityInput({ 
  ingredientName, 
  nutrition, 
  initialAmount = '100', 
  initialUnit = 'gram',
  onQuantityChange,
  pricePerUnit = 0 
}: QuantityInputProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [unit, setUnit] = useState(initialUnit);

  const calculatedGrams = useMemo(() => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount)) return null;
    return toGrams(numAmount, unit, ingredientName);
  }, [amount, unit, ingredientName]);

  const calories = useMemo(() => {
    // nutrition.calories is per 100g usually
    return calculatedGrams != null ? Math.round((nutrition.calories * calculatedGrams) / 100) : null;
  }, [nutrition.calories, calculatedGrams]);

  const cost = useMemo(() => {
    // pricePerUnit is per servingSize (usually 100g)
    return calculatedGrams != null ? ((pricePerUnit * calculatedGrams) / (nutrition.servingSize || 100)).toFixed(2) : null;
  }, [pricePerUnit, calculatedGrams, nutrition.servingSize]);

  useEffect(() => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!isNaN(numAmount)) {
      onQuantityChange(numAmount, unit, calculatedGrams);
    }
  }, [amount, unit, calculatedGrams]);

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Miktar Ayarla</Text>
      
      <Input
        label="Miktar"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0"
      />

      <Text style={styles.label}>Birim</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.unitScroll}
        contentContainerStyle={styles.unitContent}
      >
        {UNITS.map((u) => (
          <TouchableOpacity
            key={u.value}
            onPress={() => setUnit(u.value)}
            style={[
              styles.unitBadge,
              unit === u.value && styles.unitBadgeActive
            ]}
          >
            <Text style={[
              styles.unitText,
              unit === u.value && styles.unitTextActive
            ]}>
              {u.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.previewContainer}>
        <View style={styles.previewItem}>
          <Text style={styles.previewLabel}>Gramaj</Text>
          <Text style={styles.previewValue}>{calculatedGrams != null ? `≈ ${Math.round(calculatedGrams)} g` : '?'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.previewItem}>
          <Text style={styles.previewLabel}>Kalori</Text>
          <Text style={styles.previewValue}>{calories != null ? `≈ ${calories} kcal` : '?'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.previewItem}>
          <Text style={styles.previewLabel}>Maliyet</Text>
          <Text style={styles.previewValue}>{cost != null ? `≈ ₺${cost}` : '₺?.??'}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  unitScroll: {
    marginBottom: spacing.md,
  },
  unitContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  unitBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  unitBadgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  unitTextActive: {
    color: colors.textOnPrimary,
  },
  previewContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    justifyContent: 'space-between',
  },
  previewItem: {
    flex: 1,
    alignItems: 'center',
  },
  previewLabel: {
    fontFamily: typography.fontMedium,
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  previewValue: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
});
