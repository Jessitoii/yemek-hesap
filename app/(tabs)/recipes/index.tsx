import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  MagnifyingGlass,
  Carrot,
} from 'phosphor-react-native';
import { useRecipesStore } from '@/stores/recipesStore';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';

export default function RecipesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const router = useRouter();
  const { recipes, isLoading, loadRecipes, deleteRecipe } = useRecipesStore();


  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Tarifi Sil',
      `"${name}" tarifini silmek istediğine emin misin?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => await deleteRecipe(id)
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Tariflerim</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push('/(tabs)/recipes/my-ingredients')}
        >
          <Carrot size={24} color={colors.secondaryDark} weight="bold" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setIsSearchVisible(!isSearchVisible)}
        >
          <MagnifyingGlass size={24} color={colors.primaryDark} weight="bold" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.headerIconBtn, styles.addBtn]}
          onPress={() => router.push('/(tabs)/recipes/new')}
        >
          <Plus size={24} color="white" weight="bold" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && recipes.length === 0) {
    return (
      <View style={styles.container} >
        {renderHeader()}
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} >
      {renderHeader()}
      {isSearchVisible && (
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface }}>
          <TextInput
            autoFocus
            placeholder="Tariflerimde ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              height: 44,
              fontFamily: typography.fontMedium,
              fontSize: 15,
              color: colors.textPrimary,
            }}
          />
        </View>
      )}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              message="Henüz tarifin yok. Kendi tariflerini ekleyebilir veya popüler tarifler arasından seçim yapabilirsin."
              ctaLabel="Yeni Tarif Oluştur"
              onCta={() => router.push('/(tabs)/recipes/new')}
            />
            <View style={styles.emptyActions}>
              <Button
                label="Tarifleri Keşfet"
                variant="secondary"
                onPress={() => router.push('/(tabs)/discover')}
                fullWidth
              />
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontFamily: typography.fontExtraBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: colors.primary,
    ...shadow.sm,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyActions: {
    width: '100%',
    paddingHorizontal: spacing.xxl,
    marginTop: -spacing.md,
  },
});
