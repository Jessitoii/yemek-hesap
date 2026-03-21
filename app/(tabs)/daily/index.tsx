import React, { useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CaretLeft, CaretRight, Calendar, Drop, Plus } from 'phosphor-react-native';

import { useDailyStore } from '@/stores/dailyStore';
import { useUserStore } from '@/stores/userStore';
import { CalorieRing } from '@/components/daily/CalorieRing';
import { DailyStatsRow } from '@/components/daily/DailyStatsRow';
import { MacroSummary } from '@/components/daily/MacroSummary';
import { RecipeSuggestionCard } from '@/components/daily/RecipeSuggestionCard';
import { MealSection } from '@/components/daily/MealSection';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/theme';
import { typography } from '@/constants/typography';

import { MealType } from '@/types/daily';

export default function DailyScreen() {
  const router = useRouter();
  const {
    selectedDate,
    todayLog,
    isLoading,
    loadLog,
    setSelectedDate,
    suggestion,
    deleteMeal,
    addWater
  } = useDailyStore();
  const { goals, loadUser } = useUserStore();

  useEffect(() => {
    loadUser();
    loadLog(selectedDate);
  }, [selectedDate]);

  const onRefresh = React.useCallback(() => {
    loadLog(selectedDate);
  }, [selectedDate]);

  const handlePrevDay = () => {
    const prevDate = subDays(new Date(selectedDate), 1);
    setSelectedDate(format(prevDate, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const nextDate = addDays(new Date(selectedDate), 1);
    setSelectedDate(format(nextDate, 'yyyy-MM-dd'));
  };

  const isToday = isSameDay(new Date(selectedDate), new Date());

  const displayDate = useMemo(() => {
    if (isToday) return 'Bugün';
    return format(new Date(selectedDate), 'd MMMM EEEE', { locale: tr });
  }, [selectedDate, isToday]);

  const mealGroups = useMemo(() => {
    const meals = todayLog?.meals || [];
    return {
      [MealType.BREAKFAST]: meals.filter(m => m.type === MealType.BREAKFAST),
      [MealType.LUNCH]: meals.filter(m => m.type === MealType.LUNCH),
      [MealType.DINNER]: meals.filter(m => m.type === MealType.DINNER),
      [MealType.SNACK]: meals.filter(m => m.type === MealType.SNACK),
    };
  }, [todayLog?.meals]);

  if (!goals) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isTargetExceeded = (todayLog?.totalCalories || 0) >= goals.dailyCalorieTarget;

  return (
    <View style={styles.container}>
      {/* Date Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevDay} style={styles.dateNavBtn}>
          <CaretLeft size={24} color={colors.textPrimary} weight="bold" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => router.push('/(tabs)/daily/history')}
        >
          <Calendar size={20} color={colors.primary} weight="fill" style={{ marginRight: 8 }} />
          <Text style={styles.dateText}>{displayDate}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextDay}
          style={styles.dateNavBtn}
          disabled={isToday}
        >
          <CaretRight
            size={24}
            color={isToday ? colors.textDisabled : colors.textPrimary}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Calorie Progress */}
        <CalorieRing
          consumed={todayLog?.totalCalories || 0}
          target={goals.dailyCalorieTarget}
        />

        {/* Quick Stats Row */}
        <DailyStatsRow
          calories={todayLog?.totalCalories || 0}
          spending={todayLog?.totalCost || 0}
          steps={todayLog?.stepCount || 0}
          burned={todayLog?.burnedCalories || 0}
        />

        {/* Macro Summary */}
        <MacroSummary
          protein={{
            current: todayLog?.totalMacros.protein || 0,
            target: goals.macroTarget.protein
          }}
          carbs={{
            current: todayLog?.totalMacros.carbs || 0,
            target: goals.macroTarget.carbs
          }}
          fat={{
            current: todayLog?.totalMacros.fat || 0,
            target: goals.macroTarget.fat
          }}
        />

        {/* Water Tracking Card */}
        <Card style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterTitleRow}>
              <View style={styles.waterIconBox}>
                <Drop size={20} color={colors.primary} weight="fill" />
              </View>
              <Text style={styles.waterTitle}>Su Takibi</Text>
            </View>
            <Text style={styles.waterValue}>
              {todayLog?.waterIntake || 0} / {goals.waterGoal || 2000} ml
            </Text>
          </View>

          <View style={styles.waterProgressBg}>
            <View
              style={[
                styles.waterProgressFill,
                { width: `${Math.min(100, ((todayLog?.waterIntake || 0) / (goals.waterGoal || 2000)) * 100)}%` }
              ]}
            />
          </View>

          <TouchableOpacity
            style={styles.waterAddBtn}
            onPress={() => addWater(250)}
          >
            <Plus size={18} color={colors.primary} weight="bold" />
            <Text style={styles.waterAddText}>Bardak Ekle (+250ml)</Text>
          </TouchableOpacity>
        </Card>

        {/* Recipe Suggestion */}
        <RecipeSuggestionCard
          recipe={suggestion}
          isTargetExceeded={isTargetExceeded}
          onAddPress={(recipe) => {
            // In a real app, this would open porsiyon selection
            router.push({
              pathname: '/(tabs)/daily/add-meal',
              params: { recipeId: recipe.id }
            });
          }}
        />

        {/* Meal Sections */}
        <View style={styles.mealSections}>
          <MealSection
            mealType={MealType.BREAKFAST}
            items={mealGroups[MealType.BREAKFAST]}
            onAddPress={() => router.push({ pathname: '/(tabs)/daily/add-meal', params: { type: MealType.BREAKFAST } })}
            onDeleteMeal={deleteMeal}
          />
          <MealSection
            mealType={MealType.LUNCH}
            items={mealGroups[MealType.LUNCH]}
            onAddPress={() => router.push({ pathname: '/(tabs)/daily/add-meal', params: { type: MealType.LUNCH } })}
            onDeleteMeal={deleteMeal}
          />
          <MealSection
            mealType={MealType.DINNER}
            items={mealGroups[MealType.DINNER]}
            onAddPress={() => router.push({ pathname: '/(tabs)/daily/add-meal', params: { type: MealType.DINNER } })}
            onDeleteMeal={deleteMeal}
          />
          <MealSection
            mealType={MealType.SNACK}
            items={mealGroups[MealType.SNACK]}
            onAddPress={() => router.push({ pathname: '/(tabs)/daily/add-meal', params: { type: MealType.SNACK } })}
            onDeleteMeal={deleteMeal}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateNavBtn: {
    padding: spacing.xs,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  dateText: {
    fontFamily: typography.fontBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  mealSections: {
    marginTop: spacing.md,
  },
  waterCard: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  waterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  waterIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterTitle: {
    fontFamily: typography.fontBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  waterValue: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  waterProgressBg: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  waterAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight + '30',
    borderRadius: radius.lg,
    gap: spacing.xs,
  },
  waterAddText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
    color: colors.primary,
  },
});
