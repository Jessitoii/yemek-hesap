import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  MagnifyingGlass,
  Plus,
  Trash,
  ChefHat,
  Users,
  FloppyDisk,
  ArrowsClockwise
} from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useRecipesStore } from '@/stores/recipesStore';
import { useTranslate } from '@/hooks/useTranslate';
import { useNutrition } from '@/hooks/useNutrition';
import { searchMigrosProducts } from '@/services/migros';
import { extractIngredientName } from '@/utils/formatters';
import { parseMeasure, toGrams, parseProductGrams } from '@/utils/unitConverter';
import { searchRecipes } from '@/services/themealdb';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { RecipeIngredient } from '@/types/recipe';
import { Card } from '@/components/ui/Card';

const scoreMigrosMatch = (product: any, query: string, unit: string, amount: number) => {
  let score = 0;
  const productName = product.name.toLowerCase();
  const q = query.toLowerCase();

  // 1. İsim Benzerliği
  if (productName === q) score += 100;
  else if (productName.includes(q)) score += 50;

  // 2. Birim Uyumu
  const targetUnitLower = (unit || '').toLowerCase();
  if (targetUnitLower === 'gram' || targetUnitLower === 'gr' || targetUnitLower === 'kg') {
    if (productName.includes(' g') || productName.includes(' gr') || productName.includes('kg')) {
      score += 30;
    }
  } else if (targetUnitLower === 'adet' || targetUnitLower === 'tane') {
    if (productName.includes(' adet') || productName.includes(' tane')) {
      score += 30;
    }
  }

  // 3. Kelime bazlı eşleşme
  const keywords = q.split(' ');
  keywords.forEach(kw => {
    if (kw.length > 2 && productName.includes(kw)) score += 20;
  });

  return score;
};

export default function NewRecipeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const {
    recipes,
    addRecipe,
    updateRecipe,
    draftingIngredients,
    setDraftingIngredients,
    appendDraftingIngredient,
    clearDraftingIngredients,
    loadIngredients,
    addIngredient,
    ingredients: allIngredients
  } = useRecipesStore();

  const { translate, translateToEnglish, translateLongText } = useTranslate();
  const { getNutrition } = useNutrition();

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [servings, setServings] = useState('4');
  const [instructions, setInstructions] = useState('');
  const [recipeSource, setRecipeSource] = useState<'TheMealDB' | 'Custom'>('Custom');
  const [isTheMealDBSearchVisible, setIsTheMealDBSearchVisible] = useState(false);
  const [isProcessingTheMealDB, setIsProcessingTheMealDB] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadIngredients();
    // If we have an ID, we're editing
    if (id) {
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        setName(recipe.name);
        setImageUrl(recipe.imageUrl || null);
        setServings(recipe.servings.toString());
        setInstructions(recipe.instructions || '');
        setDraftingIngredients(recipe.ingredients);
        setRecipeSource(recipe.source || 'Custom');
      }
    } else {
      // Reset for new recipe
      clearDraftingIngredients();
    }
  }, [id, recipes]);

  const summary = useMemo(() => {
    return draftingIngredients.reduce((acc, ing) => {
      const detail = allIngredients.find(i => i.id === ing.ingredientId);
      if (detail) {
        const ratio = ing.grams / 100;
        acc.calories += (detail.nutrition?.calories || 0) * ratio;
        acc.protein += (detail.nutrition?.protein || 0) * ratio;
        acc.carbs += (detail.nutrition?.carbs || 0) * ratio;
        acc.fat += (detail.nutrition?.fat || 0) * ratio;
        acc.cost += (detail.lastKnownPrice || 0) * (ing.grams / (detail.nutrition?.servingSize || 100));
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 });
  }, [draftingIngredients, allIngredients]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Kamera erişimi için izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleTheMealDBSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      // 1. Her zaman İngilizceye çevirmeyi dene (TheMealDB sadece İngilizce anlıyor)
      const en = await translateToEnglish(searchQuery);
      const finalQuery = en || searchQuery;

      // 2. TheMealDB'den ara
      const data = await searchRecipes(finalQuery);

      // 3. Çıkan sonuçların isimlerini Türkçeye çevirerek göster
      const translatedResults = await Promise.all(
        data.map(async (res) => {
          const nameTr = await translate(res.name);
          return { ...res, name: nameTr || res.name };
        })
      );

      setSearchResults(translatedResults);
    } catch (error) {
      console.error('TheMealDB Search Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTheMealDBRecipe = async (recipeData: any) => {
    setIsProcessingTheMealDB(true);
    setIsTheMealDBSearchVisible(false);

    try {
      // 1. Tarif ismini ve hazırlık talimatlarını Türkçeye çevir (Talimatlar için LongText kullanıyoruz)
      const [nameTr, instructionsTr] = await Promise.all([
        translate(recipeData.name),
        translateLongText(recipeData.instructions)
      ]);

      setName(nameTr || recipeData.name);
      setImageUrl(recipeData.imageUrl);
      setInstructions(instructionsTr || recipeData.instructions);
      setRecipeSource('TheMealDB');

      // Clear existing drafting ingredients first
      setDraftingIngredients([]);

      // 2. Malzemeleri işle
      for (const raw of recipeData.ingredients) {
        // 1. Translate name to Turkish
        const nameTr = await translate(raw.nameEn);
        const nameToSearch = (nameTr || raw.nameEn)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '')
          .trim();

        // 2. Search Migros for cost/image
        const { amount, unit } = parseMeasure(raw.measure);
        const migrosMatches = await searchMigrosProducts(nameToSearch);
        
        const scored = migrosMatches
          .map(p => ({ product: p, score: scoreMigrosMatch(p, nameToSearch, unit, amount) }))
          .sort((a, b) => b.score - a.score);
        
        const bestMatch = scored.length > 0 && scored[0].score > 0 ? scored[0].product : undefined;

        // 3. Fetch Nutrition
        const nutrition = await getNutrition([
          extractIngredientName(bestMatch?.name || nameToSearch),
          bestMatch?.category || '',
          bestMatch?.topCategory || ''
        ]);

        // 4. Save to master ingredients list if not exists
        const ingId = bestMatch?.id || Math.random().toString(36).substr(2, 9);
        await addIngredient({
          id: ingId,
          name: bestMatch?.name || nameToSearch,
          imageUrl: bestMatch?.imageUrl || undefined,
          migrosProductId: bestMatch?.id,
          lastKnownPrice: bestMatch?.price || 0,
          nutrition: {
            calories: nutrition?.calories || 0,
            protein: nutrition?.protein || 0,
            carbs: nutrition?.carbs || 0,
            fat: nutrition?.fat || 0,
            servingSize: 100,
            unit: 'g'
          },
          priceSyncDate: new Date(),
          custom: false
        });

        // 5. Convert to grams
        const productGrams = bestMatch ? parseProductGrams(bestMatch.name) : undefined;
        const isKgProduct = bestMatch?.name?.toLowerCase().includes(' kg') ||
          bestMatch?.name?.toLowerCase().endsWith('kg');
        const gramsCount = toGrams(
          amount,
          unit,
          bestMatch?.name || nameToSearch,
          isKgProduct ? undefined : productGrams
        );

        const newIngredient = {
          id: Math.random().toString(36).substr(2, 9),
          recipeId: (id as string) || 'new',
          ingredientId: ingId,
          name: bestMatch?.name || nameToSearch,
          amount: amount,
          unit: unit,
          grams: gramsCount,
        };

        // Add each ingredient one by one as they are processed
        appendDraftingIngredient(newIngredient);
      }
    } catch (error) {
      console.error('Processing TheMealDB ingredients error:', error);
      Alert.alert('Hata', 'Malzemeler işlenirken bir sorun oluştu.');
    } finally {
      setIsProcessingTheMealDB(false);
    }
  };


  const handleAddIngredient = () => {
    router.push(`/(tabs)/recipes/ingredient-match`);
  };

  const handleRemoveIngredient = (ingId: string) => {
    setDraftingIngredients(draftingIngredients.filter(i => i.ingredientId !== ingId));
  };


  const handleSave = async () => {
    if (!name || draftingIngredients.length === 0) {
      Alert.alert('Eksik Bilgi', 'Lütfen tarif adı ve en az bir malzeme ekleyin.');
      return;
    }

    // Calculate dynamic totals from drafting ingredients
    const totals = draftingIngredients.reduce((acc, ing) => {
      const detail = allIngredients.find(i => i.id === ing.ingredientId);
      if (detail) {
        const ratio = ing.grams / 100;
        acc.protein += (detail.nutrition?.protein || 0) * ratio;
        acc.carbs += (detail.nutrition?.carbs || 0) * ratio;
        acc.fat += (detail.nutrition?.fat || 0) * ratio;
        acc.calories += (detail.nutrition?.calories || 0) * ratio;
        acc.cost += (detail.lastKnownPrice || 0) * (ing.grams / (detail.nutrition?.servingSize || 100));
      }
      return acc;
    }, { protein: 0, carbs: 0, fat: 0, calories: 0, cost: 0 });

    const recipePayload: any = {
      id: (id as string) || Math.random().toString(36).substr(2, 9),
      name,
      imageUrl: imageUrl || undefined,
      servings: parseInt(servings) || 4,
      ingredients: draftingIngredients,
      instructions,
      source: recipeSource,
      isFavorite: false,
      totalCalories: totals.calories,
      totalCost: totals.cost,
      macros: {
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };


    if (id) {
      await updateRecipe(recipePayload);
    } else {
      await addRecipe(recipePayload);
    }

    router.back();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.textPrimary} weight="bold" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{id ? 'Tarif Düzenle' : 'Yeni Tarif'}</Text>
      <TouchableOpacity
        onPress={handleSave}
        disabled={!name || draftingIngredients.length === 0}
        style={(!name || draftingIngredients.length === 0) ? styles.disabledSave : {}}
      >
        <FloppyDisk size={24} color={(!name || draftingIngredients.length === 0) ? colors.textDisabled : colors.primary} weight="bold" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Image Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Tarif Görseli</Text>
            <View style={styles.imageSelector}>
              {imageUrl ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImageUrl(null)}
                  >
                    <Trash size={16} color="white" weight="bold" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageOptions}>
                  <TouchableOpacity style={styles.imageOptionBtn} onPress={handleCamera}>
                    <Camera size={24} color={colors.primary} />
                    <Text style={styles.optionText}>Kamera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageOptionBtn} onPress={handlePickImage}>
                    <ImageIcon size={24} color={colors.primary} />
                    <Text style={styles.optionText}>Galeri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageOptionBtn}
                    onPress={() => setIsTheMealDBSearchVisible(true)}
                  >
                    <MagnifyingGlass size={24} color={colors.primary} />
                    <Text style={styles.optionText}>Tarif Bul</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Input
              label="Tarif Adı"
              value={name}
              onChangeText={setName}
              placeholder="Örn: Orman Kebabı"
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Porsiyon"
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                  leftIcon={<Users size={18} color={colors.textDisabled} />}
                />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                {/* Additional info like cuisine could go here */}
              </View>
            </View>
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Malzemeler</Text>
              <TouchableOpacity style={styles.addIngredientLink} onPress={handleAddIngredient}>
                <Plus size={16} color={colors.primary} weight="bold" />
                <Text style={styles.addIngredientText}>Malzeme Ekle</Text>
              </TouchableOpacity>
            </View>

            {isProcessingTheMealDB && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.processingText}>Malzemeler Migros'tan aranıyor ve maliyet hesaplanıyor...</Text>
              </View>
            )}

            {draftingIngredients.length > 0 ? (
              <View style={styles.ingredientsList}>
                {draftingIngredients.map((ing) => {
                  const detail = allIngredients.find(i => i.id === ing.ingredientId);
                  const imageUrl = detail?.imageUrl;
                  const finalUri = imageUrl 
                    ? (imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl)
                    : null;

                  return (
                    <View key={ing.ingredientId} style={styles.ingredientItem}>
                      <View style={styles.ingredientInfo}>
                        <View style={styles.ingredientImageBox}>
                          {finalUri ? (
                            <Image source={{ uri: finalUri }} style={styles.ingredientImage} />
                          ) : (
                            <ChefHat size={20} color={colors.textSecondary} />
                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.ingredientName} numberOfLines={1}>{ing.name}</Text>
                          <Text style={styles.ingredientAmount}>{ing.amount} {ing.unit}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveIngredient(ing.ingredientId)} style={{ marginLeft: 10 }}>
                        <Trash size={20} color={colors.error} weight="bold" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Card style={styles.emptyIngredients}>
                <EmptyState
                  message="Henüz malzeme eklemediniz."
                  style={{ padding: 0 }}
                />
              </Card>
            )}

            {draftingIngredients.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Tarif Özeti (Toplam)</Text>
                <View style={styles.summaryStats}>
                  <Text style={styles.summaryStatText}>🔥 {Math.round(summary.calories)} kcal</Text>
                  <Text style={styles.summaryStatText}>💰 {summary.cost.toFixed(2)} TL</Text>
                  <Text style={styles.summaryStatText}>💪 {summary.protein.toFixed(1)}g protein</Text>
                </View>
              </View>
            )}

          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Hazırlama Talimatları</Text>
            <Input
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Tarifi buraya yazabilirsiniz..."
              style={styles.textArea}
              inputStyle={{ minHeight: 120 }}
              multiline={true}
              numberOfLines={6}
            />

          </View>

          <View style={{ height: 40 }} />

          <Button
            label={id ? "Güncelle" : "Kaydet"}
            onPress={handleSave}
            disabled={!name || draftingIngredients.length === 0}
            style={styles.saveBtn}
          />



          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* TheMealDB Search Overlay Simplified as a Modal if needed, or just a simple view */}
      {isTheMealDBSearchVisible && (
        <View style={styles.searchOverlay}>
          <View style={styles.overlayHeader}>
            <Text style={styles.overlayTitle}>Hazır Tarif Ara</Text>
            <TouchableOpacity onPress={() => setIsTheMealDBSearchVisible(false)}>
              <Text style={styles.closeBtn}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: colors.accentLight, borderRadius: radius.md, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.md }}>
            <Text style={{ fontFamily: typography.fontMedium, fontSize: 13, color: colors.accentDark, lineHeight: 20 }}>
              ⚠️ Kalori ve maliyet değerleri malzemelere göre otomatik hesaplanır ancak kesin doğru olmayabilir. Malzemeleri kaydettikten sonra düzenleyebilirsiniz. Ayrıca her Türk yemeği bu veritabanında bulunmayabilir.
            </Text>
          </View>
          <View style={styles.overlaySearch}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Yemek adı (Tavuk, Makarna, Çorba...)"
            />
            <Button label="Ara" onPress={handleTheMealDBSearch} loading={isLoading} />
          </View>

          <ScrollView style={styles.overlayResults}>
            {searchResults.length === 0 && searchQuery !== '' && !isLoading ? (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyResultsText}>Sonuç bulunamadı.</Text>
              </View>
            ) : (
              searchResults.map((res) => (
                <TouchableOpacity
                  key={res.id}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectTheMealDBRecipe(res)}
                >
                  <Image source={{ uri: res.imageUrl }} style={styles.resultImage} />
                  <Text style={styles.resultName}>{res.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
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
  disabledSave: {
    opacity: 0.5,
  },
  scrollContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  imageSelector: {
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageOptions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  imageOptionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addIngredientLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addIngredientText: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.primary,
  },
  ingredientsList: {
    gap: spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ingredientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ingredientName: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  ingredientAmount: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyIngredients: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIngredientsText: {
    fontFamily: typography.fontMedium,
    color: colors.textDisabled,
    fontSize: 14,
  },
  textArea: {
    marginTop: 0,
  },
  saveBtn: {
    width: '100%',
    height: 54,
  },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 1000,
    padding: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overlayTitle: {
    fontFamily: typography.fontBold,
    fontSize: 18,
  },
  closeBtn: {
    color: colors.error,
    fontFamily: typography.fontBold,
  },
  overlaySearch: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  overlayResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },
  resultName: {
    fontFamily: typography.fontSemiBold,
    fontSize: 15,
    flex: 1,
  },
  emptyResults: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyResultsText: {
    fontFamily: typography.fontMedium,
    color: colors.textDisabled,
    fontSize: 14,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primaryLight + '10',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
  },
  processingText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 13,
    color: colors.primary,
    flex: 1,
  },
  ingredientImageBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientImage: {
    width: '100%',
    height: '100%',
  },
  summaryCard: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  summaryTitle: {
    fontFamily: typography.fontBold,
    fontSize: 13,
    color: colors.primaryDark,
    marginBottom: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryStatText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});


