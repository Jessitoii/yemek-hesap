import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Sparkle,
  Target,
  CurrencyCircleDollar,
  CalendarBlank,
  CookingPot,
  CheckCircle,
  ArrowsClockwise,
  Clock,
  Coins,
  Flame
} from 'phosphor-react-native';

import { MealType } from '@/types/daily';

import { useUserStore } from '@/stores/userStore';
import { useRecipesStore } from '@/stores/recipesStore';
import { useDailyStore } from '@/stores/dailyStore';
import { generateMealPlan } from '@/services/cerebras';
import { getSuggestion } from '@/utils/recipeSuggestion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/constants/colors';
import { spacing, radius, shadow } from '@/constants/theme';
import { typography } from '@/constants/typography';

const { width } = Dimensions.get('window');

const DURATION_OPTIONS = [
  { label: '1 Gün', value: 1 },
  { label: '3 Gün', value: 3 },
  { label: '7 Gün', value: 7 },
];

export default function MealPlanScreen() {
  const router = useRouter();
  const { profile, goals } = useUserStore();
  const { recipes, loadRecipes } = useRecipesStore();
  const { addMeal } = useDailyStore();

  const [calorieGoal, setCalorieGoal] = useState(goals?.dailyCalorieTarget?.toString() || '2000');
  const [budgetGoal, setBudgetGoal] = useState('250');
  const [duration, setDuration] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setPlanResult(null);

    try {
      // Logic for meal plan generation
      // 1. If we have enough recipes (>=10), try to use the rule engine locally
      // 2. Otherwise use Cerebras API
      if (recipes.length >= 10) {
        generateLocalPlan();
      } else {
        await generateAiPlan();
      }
    } catch (error) {
      console.error('Plan generation error:', error);
      Alert.alert('Hata', 'Plan oluşturulurken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalPlan = () => {
    const days = [];
    const calGoal = parseInt(calorieGoal);

    for (let i = 1; i <= duration; i++) {
      const meals = [];
      const mealTypes = ['kahvaltı', 'öğle', 'akşam', 'atıştırmalık'];
      const perMealCalories = calGoal / 4;

      for (const type of mealTypes) {
        const suggestion = getSuggestion(
          perMealCalories,
          recipes,
          { protein: 0, carbs: 0, fat: 0 } // Simple for now
        );

        if (suggestion) {
          meals.push({
            type,
            recipeId: suggestion.id,
            recipeName: suggestion.name,
            calories: suggestion.totalCalories,
            cost: suggestion.totalCost,
            imageUrl: suggestion.imageUrl
          });
        } else {
          // Fallback for mock if no suggestion fits
          meals.push({
            type,
            recipeName: `${type.toUpperCase()} Önerisi Bulunamadı`,
            calories: 0,
            cost: 0
          });
        }
      }
      days.push({ day: i, meals });
    }

    setPlanResult({ days, totalStats: { avgCalories: calGoal, avgCost: 0 } });
  };

  const generateAiPlan = async () => {
    const params = {
      days: duration,
      calorieGoal: parseInt(calorieGoal),
      budgetGoal: parseInt(budgetGoal),
      proteinGoal: goals?.macroTarget.protein || 150,
      carbsGoal: goals?.macroTarget.carbs || 200,
      fatGoal: goals?.macroTarget.fat || 60,
    };

    const result = await generateMealPlan(params);
    setPlanResult(result);
  };

  const handleApplyPlan = async () => {
    if (!planResult) return;

    try {
      const today = new Date();

      for (let i = 0; i < planResult.days.length; i++) {
        const dayPlan = planResult.days[i];
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        for (const meal of dayPlan.meals) {
          if (!meal.recipeId) continue;
          const recipe = recipes.find(r => r.id === meal.recipeId);
          if (!recipe) continue;

          await addMeal({
            recipeId: recipe.id,
            name: recipe.name,
            imageUrl: recipe.imageUrl,
            type: getMealType(meal.type),
            amount: 1,
            unit: 'Porsiyon',
            grams: 0,
            calories: (recipe.totalCalories || 0) / (recipe.servings || 1),
            cost: (recipe.totalCost || 0) / (recipe.servings || 1),
            macros: {
              protein: (recipe.macros.protein || 0) / (recipe.servings || 1),
              carbs: (recipe.macros.carbs || 0) / (recipe.servings || 1),
              fat: (recipe.macros.fat || 0) / (recipe.servings || 1),
            },
          }, dateStr);
        }
      }

      Alert.alert('Başarılı', `${duration} günlük plan günlüğüne uygulandı!`, [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Apply plan error:', error);
      Alert.alert('Hata', 'Plan uygulanırken bir sorun oluştu.');
    }
  };

  const getMealType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'kahvaltı': case 'breakfast': return MealType.BREAKFAST;
      case 'öğle': case 'lunch': return MealType.LUNCH;
      case 'akşam': case 'dinner': return MealType.DINNER;
      default: return MealType.SNACK;
    }
  };

  const renderInputSection = () => (
    <View style={styles.inputSection}>
      <Text style={styles.sectionTitle}>Plan Detayları</Text>

      <Input
        label="Günlük Kalori Hedefi"
        value={calorieGoal}
        onChangeText={setCalorieGoal}
        keyboardType="numeric"
        leftIcon={<Flame size={20} color={colors.primary} />}
      />

      <Input
        label="Günlük Bütçe Hedefi (₺)"
        value={budgetGoal}
        onChangeText={setBudgetGoal}
        keyboardType="numeric"
        leftIcon={<Coins size={20} color={colors.secondary} />}
      />

      <View style={styles.durationSection}>
        <Text style={styles.label}>Süre Seçin</Text>
        <View style={styles.optionsRow}>
          {DURATION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionBtn,
                duration === opt.value && styles.optionBtnActive
              ]}
              onPress={() => setDuration(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  duration === opt.value && styles.optionTextActive
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button
        label="Plan Oluştur"
        onPress={handleGeneratePlan}
        loading={isLoading}
        style={styles.generateBtn}
        leftIcon={<Sparkle size={20} color="white" weight="fill" />}
      />
    </View>
  );

  const renderPlanResult = () => (
    <View style={styles.resultSection}>
      <View style={styles.resultHeader}>
        <CheckCircle size={28} color={colors.success} weight="fill" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.resultTitle}>Öğün Planınız Hazır!</Text>
          <Text style={styles.resultSubtitle}>{duration} günlük dengeli beslenme rotası</Text>
        </View>
      </View>

      {planResult.days.map((dayPlan: any, index: number) => (
        <View key={index} style={styles.dayCard}>
          <Text style={styles.dayLabel}>GÜN {dayPlan.day || index + 1}</Text>
          <View style={styles.mealsList}>
            {dayPlan.meals.map((meal: any, mIdx: number) => (
              <View key={mIdx} style={styles.mealItem}>
                <View style={[styles.typeBadge, { backgroundColor: getMealColor(meal.type) + '20' }]}>
                  <Text style={[styles.typeText, { color: getMealColor(meal.type) }]}>
                    {meal.type.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealName} numberOfLines={1}>{meal.recipeName}</Text>
                  <View style={styles.mealStats}>
                    <Text style={styles.mealCal}>{meal.calories} kcal</Text>
                    {meal.cost > 0 && <Text style={styles.mealCost}>₺{meal.cost.toFixed(2)}</Text>}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.resultFooter}>
        <Button
          label="Bu Planı Uygula"
          onPress={handleApplyPlan}
          style={styles.applyBtn}
        />
        <TouchableOpacity style={styles.regenerateBtn} onPress={handleGeneratePlan}>
          <ArrowsClockwise size={20} color={colors.textSecondary} />
          <Text style={styles.regenerateText}>Yeniden Oluştur</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getMealColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': case 'kahvaltı': return colors.accent;
      case 'lunch': case 'öğle': return colors.primary;
      case 'dinner': case 'akşam': return colors.secondary;
      case 'snack': case 'atıştırmalık': return colors.pink;
      default: return colors.textDisabled;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.textPrimary} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Öğün Planı Oluşturucu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!planResult && renderInputSection()}
        {planResult && renderPlanResult()}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Şefimiz sizin için en iyi planı hazırlıyor...</Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
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
  backBtn: {
    padding: 4,
  },
  scroll: {
    padding: spacing.lg,
  },
  inputSection: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    ...shadow.md,
  },
  sectionTitle: {
    fontFamily: typography.fontExtraBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  durationSection: {
    marginVertical: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  optionBtnActive: {
    backgroundColor: colors.primaryLight + '30',
    borderColor: colors.primary,
  },
  optionText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.primaryDark,
  },
  generateBtn: {
    marginTop: spacing.xl,
    height: 56,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    zIndex: 10,
  },
  loadingText: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 20,
  },
  resultSection: {
    gap: spacing.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.success + '10',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  resultTitle: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.success,
  },
  resultSubtitle: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  dayLabel: {
    fontFamily: typography.fontExtraBold,
    fontSize: 12,
    color: colors.textDisabled,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  mealsList: {
    gap: spacing.md,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  typeBadge: {
    width: 90,
    paddingVertical: 4,
    borderRadius: radius.xs,
    alignItems: 'center',
  },
  typeText: {
    fontFamily: typography.fontBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontFamily: typography.fontBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  mealStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  mealCal: {
    fontFamily: typography.fontSemiBold,
    fontSize: 12,
    color: colors.primaryDark,
  },
  mealCost: {
    fontFamily: typography.fontSemiBold,
    fontSize: 12,
    color: colors.secondaryDark,
  },
  resultFooter: {
    marginTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  applyBtn: {
    height: 56,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
  },
  regenerateText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
