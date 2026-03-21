import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Carrot
} from 'phosphor-react-native';

import { useRecipesStore } from '@/stores/recipesStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Card } from '@/components/ui/Card';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.md * 3) / 2;

export default function MyIngredientsScreen() {
  const router = useRouter();
  const { ingredients, isLoading, loadIngredients } = useRecipesStore();

  useEffect(() => {
    loadIngredients();
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.textPrimary} weight="bold" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Malzemelerim</Text>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/(tabs)/recipes/my-ingredients/new')}
      >
        <Plus size={20} color="white" weight="bold" />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push(`/(tabs)/recipes/my-ingredients/${item.id}`)}
    >
      <Card style={styles.itemCard}>
        <View style={styles.itemImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="contain" />
          ) : (
            <View style={[styles.itemImage, styles.noImage]}>
              <Carrot size={32} color={colors.textDisabled} weight="thin" />
            </View>
          )}
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemInfo}>
            {item.nutrition.calories} kcal / 100g
          </Text>
          <Text style={[styles.itemPrice, { color: item.lastKnownPrice ? colors.secondaryDark : colors.textDisabled }]}>
            {item.lastKnownPrice ? `₺${item.lastKnownPrice.toFixed(2)}` : 'Fiyat girilmedi'}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              message="Malzeme kutun boş. Özel malzemelerini ekleyerek tariflerinde kullanabilirsin."
              ctaLabel="Yeni Malzeme Ekle"
              onCta={() => router.push('/(tabs)/recipes/my-ingredients/new')}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.sm,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: COLUMN_WIDTH,
    marginBottom: spacing.md,
  },
  itemCard: {
    padding: 0,
    overflow: 'hidden',
    height: 200,
  },
  itemImageContainer: {
    height: 100,
    backgroundColor: 'white',
    padding: spacing.sm,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
  },
  itemContent: {
    padding: spacing.sm,
    flex: 1,
  },
  itemName: {
    fontFamily: typography.fontBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 4,
    height: 34,
  },
  itemInfo: {
    fontFamily: typography.fontMedium,
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: typography.fontBold,
    fontSize: 12,
  },
  emptyContainer: {
    marginTop: 60,
  },
});
