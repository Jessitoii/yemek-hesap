import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MagnifyingGlass,
  FadersHorizontal,
  Heart,
  Sparkle,
  GlobeHemisphereWest,
  Clock,
  Fire,
  ArrowRight,
  CalendarBlank
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../constants/colors';
import { spacing, radius, shadow } from '../../../constants/theme';
import { typography } from '../../../constants/typography';
import { DiscoverCard } from '../../../components/discover/DiscoverCard';
import { CategoryChip } from '../../../components/discover/CategoryChip';
import { CalorieRangeCard } from '../../../components/discover/CalorieRangeCard';
import { CuisineCard } from '../../../components/discover/CuisineCard';
import { RandomRecipeCard } from '../../../components/discover/RandomRecipeCard';
import { FilterPanel } from '../../../components/discover/FilterPanel';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';

import { useRecipesStore } from '@/stores/recipesStore';
import { getRandomMeal, getMealsByCategory, getMealsByArea, searchMeals } from '@/services/themealdb';
import { useTranslate } from '@/hooks/useTranslate';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', label: 'Kahvaltı', emoji: '🍳' },
  { id: '2', label: 'Öğle Yemeği', emoji: '🥗' },
  { id: '3', label: 'Akşam Yemeği', emoji: '🍲' },
  { id: '4', label: 'Atıştırmalık', emoji: '🥪' },
  { id: '5', label: 'Tatlı', emoji: '🍰' },
  { id: '6', label: 'İçecek', emoji: '🥤' },
];

const CALORIE_RANGES = [
  { label: '0-200', emoji: '🥬', color: colors.secondaryDark, bg: colors.secondaryLight },
  { label: '200-400', emoji: '🥗', color: colors.primaryDark, bg: colors.primaryLight },
  { label: '400-600', emoji: '🍜', color: colors.accentDark, bg: colors.accentLight },
  { label: '600-800', emoji: '🍔', color: colors.accentDark, bg: colors.accentLight },
  { label: '800-1000', emoji: '🍕', color: colors.error, bg: colors.bordoLight },
  { label: '1000+', emoji: '🍰', color: colors.bordoDark, bg: colors.bordoLight },
];

const CUISINES = [
  { name: 'İtalyan', image: 'https://www.themealdb.com/images/category/pasta.png', count: 42 },
  { name: 'Meksika', image: 'https://www.themealdb.com/images/category/beef.png', count: 28 },
  { name: 'Türk', image: 'https://www.themealdb.com/images/category/lamb.png', count: 35 },
  { name: 'Japon', image: 'https://www.themealdb.com/images/category/seafood.png', count: 19 },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const { recipes } = useRecipesStore();
  const { translateToEnglish } = useTranslate();
  const [activeTab, setActiveTab] = useState<'discover' | 'favorites'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('1');

  const [randomRecipe, setRandomRecipe] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [calorieFilterResults, setCalorieFilterResults] = useState<any[]>([]);
  const [selectedCalorieRange, setSelectedCalorieRange] = useState<string | null>(null);
  const [cuisineResults, setCuisineResults] = useState<any[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [isCuisineLoading, setIsCuisineLoading] = useState(false);

  const [activeFilters, setActiveFilters] = useState<any>({
    categories: [],
    cuisines: [],
    macros: [],
    sort: 'relevant',
  });

  useEffect(() => {
    fetchRandomRecipe();
  }, []);

  useEffect(() => {
    if (activeFilters.categories.length > 0 || activeFilters.cuisines.length > 0) {
      applyFilters();
    }
  }, [activeFilters]);

  const fetchRandomRecipe = async () => {
    const meal = await getRandomMeal();
    if (meal) setRandomRecipe(meal);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      // Türkçe sorguyu İngilizce'ye çevir (TheMealDB İngilizce içerik barındırdığı için)
      const englishQuery = await translateToEnglish(searchQuery);
      console.log('[Search] TR:', searchQuery, '→ EN:', englishQuery);

      const results = await searchMeals(englishQuery || searchQuery);
      setSearchResults(results || []);
    } catch (error) {
      console.error('[Search] Error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCalorieRangePress = (range: string) => {
    if (selectedCalorieRange === range) {
      setSelectedCalorieRange(null);
      setCalorieFilterResults([]);
      return;
    }

    const [min, max] = range.includes('+')
      ? [1000, Infinity]
      : range.split('-').map(Number);

    const filtered = recipes.filter(r => {
      const perServing = (r.totalCalories || 0) / (r.servings || 1);
      return perServing >= min && perServing <= max;
    });

    setSelectedCalorieRange(range);
    setCalorieFilterResults(filtered);
  };

  const handleCuisinePress = async (cuisineName: string) => {
    if (selectedCuisine === cuisineName) {
      setSelectedCuisine(null);
      setCuisineResults([]);
      return;
    }

    setIsCuisineLoading(true);
    setSelectedCuisine(cuisineName);

    const areaMap: Record<string, string> = {
      'İtalyan': 'Italian',
      'Meksika': 'Mexican',
      'Türk': 'Turkish',
      'Japon': 'Japanese',
      'Fransız': 'French',
      'Hint': 'Indian',
      'Çin': 'Chinese',
      'Yunan': 'Greek',
      'Amerikan': 'American',
      'İngiliz': 'British',
    };

    const area = areaMap[cuisineName] || cuisineName;
    const results = await getMealsByArea(area);
    setCuisineResults(results || []);
    setIsCuisineLoading(false);
  };

  const applyFilters = async () => {
    if (activeFilters.categories.length === 0 && activeFilters.cuisines.length === 0) return;

    setIsSearching(true);
    let results: any[] = [];

    if (activeFilters.categories.length > 0) {
      for (const cat of activeFilters.categories) {
        // TheMealDB category names focus on one-word keys like 'Breakfast', 'Chicken', etc.
        // We might need a small map if CATEGORIES labels differ significantly
        const categoryMap: any = {
          'Kahvaltı': 'Breakfast',
          'Öğle Yemeği': 'Beef', // Basic fallback mapping
          'Akşam Yemeği': 'Seafood', // Basic fallback mapping
          'Atıştırmalık': 'Side',
          'Tatlı': 'Dessert',
          'İçecek': 'Miscellaneous'
        };
        const catName = categoryMap[cat] || cat;
        const r = await getMealsByCategory(catName);
        results = [...results, ...r];
      }
    }

    if (activeFilters.cuisines.length > 0) {
      const areaMap: Record<string, string> = {
        'İtalyan': 'Italian',
        'Meksika': 'Mexican',
        'Türk': 'Turkish',
        'Japon': 'Japanese',
        'Fransız': 'French',
        'Hint': 'Indian',
        'Çin': 'Chinese',
        'Yunan': 'Greek',
        'Amerikan': 'American',
        'İngiliz': 'British',
      };

      for (const cuisine of activeFilters.cuisines) {
        const area = areaMap[cuisine] || cuisine;
        const r = await getMealsByArea(area);
        results = [...results, ...r];
      }
    }

    // Duplicate'leri kaldır
    const unique = results.filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i);

    // Sıralama uygula
    if (activeFilters.sort === 'relevant') {
      setSearchResults(unique);
    } else {
      setSearchResults(unique); // Kalori bazlı sıralama için detay lazım, şimdilik olduğu gibi
    }

    setIsSearching(false);
  };

  const renderDiscoverTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Input
          placeholder="Tarif veya yemek ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          leftIcon={<MagnifyingGlass size={20} color={colors.textSecondary} />}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <FadersHorizontal size={24} color={activeFilters.categories.length > 0 || activeFilters.cuisines.length > 0 ? colors.accent : colors.primary} weight="bold" />
        </Pressable>
      </View>

      {/* Active Filters Display */}
      {(activeFilters.categories.length > 0 || activeFilters.cuisines.length > 0) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.sm, gap: spacing.sm }}>
          <Text style={{ fontFamily: typography.fontMedium, fontSize: 13, color: colors.textSecondary, flex: 1 }}>
            Filtre aktif: {[...activeFilters.categories, ...activeFilters.cuisines].join(', ')}
          </Text>
          <Pressable onPress={() => {
            setActiveFilters({ categories: [], cuisines: [], macros: [], sort: 'relevant' });
            setSearchResults([]);
          }}>
            <Text style={{ fontFamily: typography.fontBold, fontSize: 13, color: colors.error }}>Temizle</Text>
          </Pressable>
        </View>
      )}

      {isSearching && (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Arama Sonuçları</Text>
            <Pressable onPress={() => setSearchResults([])}>
              <Text style={styles.clearResults}>Temizle</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipesScroll}>
            {searchResults.map(r => (
              <DiscoverCard
                key={r.id}
                id={r.id}
                name={r.name}
                image={r.imageUrl}
                calories={0}
                cuisine={r.cuisine}
                onPress={() => router.push(`/(tabs)/discover/${r.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Popüler Kategoriler */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popüler Kategoriler</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES.map(cat => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              emoji={cat.emoji}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Akıllı Öğün Planlayıcı */}
      <View style={styles.section}>
        <Card
          onPress={() => router.push('/(tabs)/discover/meal-plan')}
          style={styles.planCard}
        >
          <View style={styles.planIcon}>
            <CalendarBlank size={32} color="white" weight="fill" />
          </View>
          <View style={styles.planContent}>
            <Text style={styles.planTitle}>Akıllı Öğün Planlayıcı</Text>
            <Text style={styles.planSubtitle}>Kişisel hedeflerine ve bütçene uygun haftalık plan oluştur.</Text>
          </View>
          <ArrowRight size={20} color={colors.textDisabled} />
        </Card>
      </View>

      {/* Bugün Ne Pişirsem? */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Sparkle size={20} color={colors.accent} weight="fill" />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Bugün Ne Pişirsem?</Text>
          </View>
        </View>
        <RandomRecipeCard
          name={randomRecipe?.name || 'Yükleniyor...'}
          image={randomRecipe?.imageUrl || ''}
          calories={0}
          onRefresh={fetchRandomRecipe}
          onPress={() => randomRecipe && router.push(`/(tabs)/discover/${randomRecipe.id}`)}
        />
      </View>
      {/* Kaloriye Göre */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Fire size={20} color={colors.error} weight="fill" />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Kaloriye Göre</Text>
          </View>
        </View>
        <View style={styles.calorieGrid}>
          {CALORIE_RANGES.map((range, index) => (
            <CalorieRangeCard
              key={index}
              label={range.label}
              emoji={range.emoji}
              color={range.color}
              backgroundColor={range.bg}
              onPress={() => handleCalorieRangePress(range.label)}
              style={{ opacity: selectedCalorieRange && selectedCalorieRange !== range.label ? 0.5 : 1 }}
            />
          ))}
        </View>
      </View>

      {/* Kalori Filtre Sonuçları */}
      {selectedCalorieRange && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{selectedCalorieRange} kcal Tarifler</Text>
            <Pressable onPress={() => { setSelectedCalorieRange(null); setCalorieFilterResults([]); }}>
              <Text style={styles.clearResults}>Temizle</Text>
            </Pressable>
          </View>
          {calorieFilterResults.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontFamily: typography.fontMedium, fontSize: 14 }}>
              Bu kalori aralığında kaydedilmiş tarifiniz yok.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipesScroll}>
              {calorieFilterResults.map(recipe => (
                <DiscoverCard
                  key={recipe.id}
                  id={recipe.id}
                  name={recipe.name}
                  image={recipe.imageUrl || ''}
                  calories={Math.round((recipe.totalCalories || 0) / (recipe.servings || 1))}
                  cuisine={recipe.source || ''}
                  onPress={() => router.push(`/(tabs)/recipes/${recipe.id}`)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Dünyadan Lezzetler */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <GlobeHemisphereWest size={20} color={colors.primary} weight="fill" />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Dünyadan Lezzetler</Text>
          </View>
          <Pressable style={styles.row}>
            <Text style={styles.seeAll}>Tümü</Text>
            <ArrowRight size={14} color={colors.primary} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cuisinesScroll}>
          {CUISINES.map((cuisine, index) => (
            <CuisineCard
              key={index}
              name={cuisine.name}
              image={cuisine.image}
              recipeCount={cuisine.count}
              onPress={() => handleCuisinePress(cuisine.name)}
              style={{ opacity: selectedCuisine && selectedCuisine !== cuisine.name ? 0.5 : 1 }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Mutfak Sonuçları */}
      {(selectedCuisine || isCuisineLoading) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{selectedCuisine} Mutfağı</Text>
            <Pressable onPress={() => { setSelectedCuisine(null); setCuisineResults([]); }}>
              <Text style={styles.clearResults}>Temizle</Text>
            </Pressable>
          </View>
          {isCuisineLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipesScroll}>
              {cuisineResults.map(r => (
                <DiscoverCard
                  key={r.id}
                  id={r.id}
                  name={r.name}
                  image={r.imageUrl || r.strMealThumb || ''}
                  calories={0}
                  cuisine={selectedCuisine || ''}
                  onPress={() => router.push(`/(tabs)/discover/${r.id}`)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Senin İçin Seçtiklerimiz (Tariflerimden) */}
      {recipes.length > 0 && (
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tariflerimden Seçtiklerim</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipesScroll}>
            {recipes.slice(0, 5).map(recipe => (
              <DiscoverCard
                key={recipe.id}
                id={recipe.id}
                name={recipe.name}
                image={recipe.imageUrl || ''}
                calories={Math.round((recipe.totalCalories || 0) / (recipe.servings || 1))}
                cuisine={recipe.source || ''}
                onPress={() => router.push(`/(tabs)/recipes/${recipe.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );

  const renderFavoritesTab = () => {
    const favoriteRecipes = recipes.filter(r => r.isFavorite);

    if (favoriteRecipes.length === 0) {
      return (
        <View style={styles.favoritesContainer}>
          <EmptyState
            title="Henüz favori yok"
            message="Beğendiğin tarifleri favorilerine ekleyerek burada görebilirsin."
            ctaLabel="Keşfetmeye Başla"
            onCta={() => setActiveTab('discover')}
          />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.favoritesGrid}>
        {favoriteRecipes.map(recipe => (
          <View key={recipe.id} style={styles.favoriteCardWrapper}>
            <DiscoverCard
              id={recipe.id}
              name={recipe.name}
              image={recipe.imageUrl || ''}
              calories={Math.round((recipe.totalCalories || 0) / (recipe.servings || 1))}
              cuisine={recipe.source || ''}
              onPress={() => router.push(`/(tabs)/recipes/${recipe.id}`)}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.header}>
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>KEŞFET</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>FAVORİLER</Text>
          </Pressable>
        </View>
      </View>

      {activeTab === 'discover' ? renderDiscoverTab() : renderFavoritesTab()}

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setFilterVisible(false);
        }}
        onReset={() => setActiveFilters({ categories: [], cuisines: [], macros: [], sort: 'relevant' })}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: -1,
  },
  tab: {
    paddingVertical: spacing.md,
    marginRight: spacing.xxl,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textDisabled,
    letterSpacing: 1,
  },
  activeTabText: {
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginVertical: 0,
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontExtraBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.primary,
  },
  categoriesScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  calorieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  cuisinesScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  recipesScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearResults: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.primary,
  },
  favoritesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  planContent: {
    flex: 1,
  },
  planTitle: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  planSubtitle: {
    fontFamily: typography.fontRegular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  favoriteCardWrapper: {
    width: (width - spacing.md * 3) / 2, // 2 items per row with gap
  },
});
