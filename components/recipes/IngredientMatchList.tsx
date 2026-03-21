import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { useMigrosSearch } from '@/hooks/useMigrosSearch';
import { MigrosProductCard } from './MigrosProductCard';
import { MigrosProduct } from '@/types/ingredient';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { MagnifyingGlass } from 'phosphor-react-native';

interface IngredientMatchListProps {
  onSelect: (product: MigrosProduct) => void;
  query: string;
}

export function IngredientMatchList({ onSelect, query }: IngredientMatchListProps) {
  const { results, isLoading, setQuery } = useMigrosSearch();

  // Update hook query when prop query changes
  React.useEffect(() => {
    setQuery(query);
  }, [query]);

  if (isLoading && results.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Migros'ta aranıyor...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MigrosProductCard 
          product={item}
          onSelect={onSelect} 
        />
      )}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        !isLoading && query.length >= 2 ? (
          <EmptyState
            title="Ürün Bulunamadı"
            message={`"${query}" için Migros'ta eşleşen bir ürün bulamadık. Başka bir kelimeyle arayabilirsin.`}
            icon={<MagnifyingGlass size={48} color={colors.textDisabled} />}
          />
        ) : null
      }

    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loading: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
    fontSize: 14,
  },
});
