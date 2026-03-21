import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
  initialFilters?: any;
}

const CATEGORIES = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous', 
  'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 
  'Vegan', 'Vegetarian', 'Breakfast', 'Goat'
];

const CUISINES = [
  'American', 'British', 'Canadian', 'Chinese', 'Croatian', 
  'Dutch', 'Egyptian', 'French', 'Greek', 'Indian', 
  'Irish', 'Italian', 'Jamaican', 'Japanese', 'Kenyan', 
  'Malaysian', 'Mexican', 'Moroccan', 'Polish', 'Portuguese', 
  'Russian', 'Spanish', 'Thai', 'Tunisian', 'Turkish', 'Vietnamese'
];

const MACROS = [
  'Yüksek Protein', 'Düşük Karbonhidrat', 'Dengeli', 'Düşük Yağ', 'Ketojenik', 'Vegan'
];

const SORT_OPTIONS = [
  { label: 'İlgili', value: 'relevant' },
  { label: 'En Az Kalori', value: 'min_cal' },
  { label: 'En Çok Kalori', value: 'max_cal' },
  { label: 'En Ucuz', value: 'min_cost' },
  { label: 'En Pahalı', value: 'max_cost' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  visible,
  onClose,
  onApply,
  onReset,
  initialFilters = {
    categories: [],
    cuisines: [],
    macros: [],
    sort: 'relevant',
  },
}) => {
  const [filters, setFilters] = useState(initialFilters);

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
      macros: [],
      sort: 'relevant',
    };
    setFilters(defaultFilters);
    onReset();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Filtrele">
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(cat => (
              <Chip
                key={cat}
                label={cat}
                selected={filters.categories.includes(cat)}
                onPress={() => setFilters({ ...filters, categories: toggleItem(filters.categories, cat) })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mutfaklar</Text>
          <View style={styles.chipRow}>
            {CUISINES.map(cuisine => (
              <Chip
                key={cuisine}
                label={cuisine}
                selected={filters.cuisines.includes(cuisine)}
                onPress={() => setFilters({ ...filters, cuisines: toggleItem(filters.cuisines, cuisine) })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Makrolar</Text>
          <View style={styles.chipRow}>
            {MACROS.map(macro => (
              <Chip
                key={macro}
                label={macro}
                selected={filters.macros.includes(macro)}
                onPress={() => setFilters({ ...filters, macros: toggleItem(filters.macros, macro) })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sıralama</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={filters.sort === opt.value}
                onPress={() => setFilters({ ...filters, sort: opt.value })}
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
