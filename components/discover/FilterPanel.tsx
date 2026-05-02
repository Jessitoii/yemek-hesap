import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/theme';
import { typography } from '../../constants/typography';
import { getAreas } from '@/services/themealdb';

export interface DiscoverFilters {
  categories: string[];
  cuisines: string[];
}

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: DiscoverFilters) => void;
  onReset: () => void;
  initialFilters?: DiscoverFilters;
}

const CATEGORIES = [
  { label: 'Dana Eti', value: 'Beef' },
  { label: 'Tavuk', value: 'Chicken' },
  { label: 'Tatlı', value: 'Dessert' },
  { label: 'Kuzu Eti', value: 'Lamb' },
  { label: 'Diğer', value: 'Miscellaneous' },
  { label: 'Makarna', value: 'Pasta' },
  { label: 'Domuz Eti', value: 'Pork' },
  { label: 'Deniz Ürünleri', value: 'Seafood' },
  { label: 'Yan Yemek', value: 'Side' },
  { label: 'Başlangıç', value: 'Starter' },
  { label: 'Vegan', value: 'Vegan' },
  { label: 'Vejetaryen', value: 'Vegetarian' },
  { label: 'Kahvaltı', value: 'Breakfast' },
  { label: 'Keçi Eti', value: 'Goat' },
];

const CUISINE_LABELS: Record<string, string> = {
  American: 'Amerikan',
  British: 'İngiliz',
  Canadian: 'Kanada',
  Chinese: 'Çin',
  Croatian: 'Hırvat',
  Dutch: 'Hollanda',
  Egyptian: 'Mısır',
  French: 'Fransız',
  Greek: 'Yunan',
  Indian: 'Hint',
  Irish: 'İrlanda',
  Italian: 'İtalyan',
  Jamaican: 'Jamaika',
  Japanese: 'Japon',
  Kenyan: 'Kenya',
  Malaysian: 'Malezya',
  Mexican: 'Meksika',
  Moroccan: 'Fas',
  Polish: 'Polonya',
  Portuguese: 'Portekiz',
  Russian: 'Rus',
  Spanish: 'İspanyol',
  Thai: 'Tayland',
  Tunisian: 'Tunus',
  Turkish: 'Türk',
  Vietnamese: 'Vietnam',
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  visible,
  onClose,
  onApply,
  onReset,
  initialFilters = {
    categories: [],
    cuisines: [],
  },
}) => {
  const [filters, setFilters] = useState<DiscoverFilters>(initialFilters);
  const [cuisines, setCuisines] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;

    setFilters(initialFilters);
    getAreas().then(setCuisines);
  }, [initialFilters, visible]);

  const toggleItem = (list: string[], item: string) => {
    if (list.includes(item)) {
      return list.filter(i => i !== item);
    }
    return [...list, item];
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters = {
      categories: [],
      cuisines: [],
    };
    setFilters(defaultFilters);
    onReset();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Filtreler">
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategori</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(cat => (
              <Chip
                key={cat.value}
                label={cat.label}
                selected={filters.categories.includes(cat.value)}
                onPress={() => setFilters({ ...filters, categories: toggleItem(filters.categories, cat.value) })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mutfak</Text>
          <View style={styles.chipRow}>
            {cuisines.map((cuisine, index) => (
              <Chip
                key={`cuisine-${index}-${cuisine}`}
                label={CUISINE_LABELS[cuisine] ?? cuisine}
                selected={filters.cuisines.includes(cuisine)}
                onPress={() => setFilters({ ...filters, cuisines: toggleItem(filters.cuisines, cuisine) })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="outline"
          label="Sıfırla"
          style={styles.resetButton}
          onPress={handleReset}
        />
        <Button
          label="Filtreleri Uygula"
          style={styles.applyButton}
          onPress={handleApply}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 500,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
    borderColor: colors.border,
  },
  applyButton: {
    flex: 2,
  },
});
