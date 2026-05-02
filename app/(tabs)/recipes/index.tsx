import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import {
  Plus,
  MagnifyingGlass,
  Carrot,
  Trash,
} from 'phosphor-react-native';
import { useRecipesStore } from '@/stores/recipesStore';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';

export default function RecipesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const openSwipeableRef = useRef<Swipeable | null>(null);
  const router = useRouter();
  const { recipes, isLoading, loadRecipes, deleteRecipe } = useRecipesStore();

  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeOpenSwipeable = () => {
    openSwipeableRef.current?.close();
    openSwipeableRef.current = null;
  };

  const handleDelete = async (id: string, swipeable: Swipeable | null) => {
    await deleteRecipe(id);
    swipeable?.close();
    if (openSwipeableRef.current === swipeable) {
      openSwipeableRef.current = null;
    }
    setShowDeleteToast(true);
  };

  const renderRecipeItem = ({ item }: { item: typeof filteredRecipes[number] }) => {
    let swipeable: Swipeable | null = null;

    const renderRightActions = () => (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.deleteAction}
        onPress={() => handleDelete(item.id, swipeable)}
      >
        <Trash size={24} color={colors.surface} weight="bold" />
        <Text style={styles.deleteActionText}>Sil</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable
        ref={(ref) => {
          swipeable = ref;
        }}
        renderRightActions={renderRightActions}
        overshootRight={false}
        onSwipeableOpen={() => {
          if (openSwipeableRef.current && openSwipeableRef.current !== swipeable) {
            openSwipeableRef.current.close();
          }
          openSwipeableRef.current = swipeable;
        }}
      >
        <RecipeCard recipe={item} />
      </Swipeable>
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
        renderItem={renderRecipeItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={closeOpenSwipeable}
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
      <Toast
        message="Tarif silindi"
        type="success"
        visible={showDeleteToast}
        onClose={() => setShowDeleteToast(false)}
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
  deleteAction: {
    width: 80,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteActionText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 13,
    color: colors.surface,
  },
});
