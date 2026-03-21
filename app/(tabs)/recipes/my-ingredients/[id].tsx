import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ImageIcon,
  MagnifyingGlass,
  FloppyDisk,
  Trash,
  ArrowsClockwise
} from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useRecipesStore } from '@/stores/recipesStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { getNutritionFromOFF } from '@/services/openfoodfacts';
import { Ingredient } from '@/types/ingredient';

export default function IngredientDetailScreen() {
  const router = useRouter();
  const { id, recipeId, amount: paramAmount, unit: paramUnit, grams: paramGrams } = useLocalSearchParams();
  const { ingredients, addIngredient, deleteIngredient, loadIngredients } = useRecipesStore();

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('gram');
  // Helper to ensure Migros/external URLs have correct protocol
  const getFullImageUrl = (url: string | null) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('file://') || trimmed.startsWith('content://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }
    if (!trimmed.startsWith('http')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  useEffect(() => {
    const init = async () => {
      // If we already loaded once for this ID, don't overwrite
      if (imageUrl && !imageUrl) {
        setImageUrl(imageUrl || null);
      }

      if (ingredients.length === 0) {
        await loadIngredients();
      }

      if (id && id !== 'new') {
        const ing = ingredients.find(i => String(i.id) === String(id));
        if (ing) {
          setName(ing.name);
          setImageUrl(ing.imageUrl || null);
          setPrice(ing.lastKnownPrice?.toString() || '');
          setCalories(ing.nutrition.calories.toString());
          setProtein(ing.nutrition.protein.toString());
          setCarbs(ing.nutrition.carbs.toString());
          setFat(ing.nutrition.fat.toString());
          setAmount(String(paramAmount));
          setUnit(String(paramUnit));
          setIsInitialLoaded(true);
        }
      } else {
        setIsInitialLoaded(true);
      }
    };

    init();
  }, [id, ingredients, isInitialLoaded]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImageUrl(result.assets[0].uri);
  };

  const handleFetchNutrition = async () => {
    if (!name) {
      Alert.alert('İpucu', 'Lütfen besin değerlerini getirmek için önce ürün adını yazın.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await getNutritionFromOFF(name);
      if (data) {
        setCalories(data.calories.toString());
        setProtein((data.protein || 0).toString());
        setCarbs((data.carbs || 0).toString());
        setFat((data.fat || 0).toString());
      } else {
        Alert.alert('Üzgünüz', 'OpenFoodFacts üzerinde bu ürünü bulamadık.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Eksik Bilgi', 'Lütfen ürün adını girin.');
      return;
    }

    const newIngredient: Ingredient = {
      id: (id && id !== 'new') ? (id as string) : Math.random().toString(36).substr(2, 9),
      name,
      imageUrl: imageUrl || undefined,
      lastKnownPrice: price ? parseFloat(price.replace(',', '.')) : undefined,
      nutrition: {
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        servingSize: 100,
        unit: 'g'
      },
      custom: true,
      priceSyncDate: new Date(),
    };

    await addIngredient(newIngredient);
    router.back();
  };

  const handleDelete = async () => {
    Alert.alert(
      'Malzemeyi Sil',
      'Bu malzemeyi silmek istediğine emin misin? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteIngredient(id as string);
            router.back();
          }
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.textPrimary} weight="bold" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {id === 'new' ? 'Yeni Malzeme' : 'Malzemeyi Düzenle'}
      </Text>
      <View style={styles.headerRight}>
        {id !== 'new' && (
          <TouchableOpacity onPress={handleDelete}>
            <Trash size={24} color={colors.error} weight="bold" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSave} disabled={!name}>
          <FloppyDisk size={24} color={name ? colors.primary : colors.textDisabled} weight="bold" />
        </TouchableOpacity>
      </View>
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
          <View style={styles.imageSection}>
            {imageUrl ? (
              <TouchableOpacity onPress={handlePickImage} style={styles.imagePreviewContainer}>
                eski image:

                <Image
                  source={{ uri: imageUrl || 'https://picsum.photos/200' }}
                  resizeMode="contain"
                  style={{ width: 120, height: 120, backgroundColor: 'white' }}
                />


                {isImageLoading && (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}

                <View style={styles.editImageOverlay}>
                  <ImageIcon size={20} color="white" weight="bold" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handlePickImage} style={styles.imagePlaceholder}>
                <ImageIcon size={32} color={colors.textDisabled} weight="thin" />
                <Text style={styles.placeholderText}>Görsel Ekle</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Input
              label="Malzeme Adı (TR)"
              value={name}
              onChangeText={setName}
              placeholder="Örn: Tam Yağlı Süt"
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Fiyat (TL)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>
              <TouchableOpacity
                style={styles.searchMigrosBtn}
                onPress={() => router.push({
                  pathname: '/(tabs)/recipes/ingredient-match',
                  params: { initialQuery: name }
                })}
              >
                <MagnifyingGlass size={20} color={colors.primary} weight="bold" />
                <Text style={styles.searchMigrosText}>Migros'ta Ara</Text>
              </TouchableOpacity>
            </View>
          </View>

          {recipeId && (
            <View style={styles.section}>
              <View style={styles.amountRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Miktar</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={{ flex: 2.5, marginLeft: spacing.md }}>
                  <Text style={styles.inputLabel}>Birim</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
                    {['gram', 'ml', 'adet', 'yemek kaşığı', 'çay kaşığı', 'su bardağı', 'dilim', 'avuç', 'diş'].map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, unit === u && styles.unitChipActive]}
                        onPress={() => setUnit(u)}
                      >
                        <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          )}

          {/* Nutrition Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Besin Değerleri (100g için)</Text>
              <TouchableOpacity
                onPress={handleFetchNutrition}
                style={styles.fetchBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size={14} color={colors.primary} />
                ) : (
                  <>
                    <ArrowsClockwise size={16} color={colors.primary} />
                    <Text style={styles.fetchText}>Otomatik Getir</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.nutritionGrid}>
              <View style={styles.nutriItem}>
                <Input label="Kalori" value={calories} onChangeText={setCalories} keyboardType="numeric" />
              </View>
              <View style={styles.nutriItem}>
                <Input label="Protein" value={protein} onChangeText={setProtein} keyboardType="numeric" />
              </View>
              <View style={styles.nutriItem}>
                <Input label="Karbonhidrat" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
              </View>
              <View style={styles.nutriItem}>
                <Input label="Yağ" value={fat} onChangeText={setFat} keyboardType="numeric" />
              </View>
            </View>
          </View>

          <Button
            label={id && id !== 'new' ? "Güncelle" : "Kaydet"}
            onPress={handleSave}
            fullWidth
            disabled={!name}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  scrollContent: {
    padding: spacing.md,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imagePreviewContainer: {
    width: 120,
    height: 120,
    backgroundColor: "white",
    overflow: "hidden",
    ...shadow.sm,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  searchMigrosBtn: {
    height: 52,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  searchMigrosText: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.primary,
  },
  fetchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fetchText: {
    fontFamily: typography.fontBold,
    fontSize: 13,
    color: colors.primary,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutriItem: {
    width: (Dimensions.get('window').width - spacing.md * 2 - 12) / 2,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  saveBtn: {
    width: '100%',
    height: 54,
    marginTop: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontFamily: typography.fontBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  amountInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  unitSelector: {
    height: 48,
  },
  unitChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    marginRight: spacing.xs,
    height: 40,
  },
  unitChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitChipText: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  unitChipTextActive: {
    color: colors.textOnPrimary,
    fontFamily: typography.fontBold,
  },
});
