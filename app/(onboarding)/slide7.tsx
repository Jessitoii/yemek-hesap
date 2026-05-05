import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SlideContainer } from '@/components/onboarding/SlideContainer';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useOnboarding } from './_layout';
import { calcBMR, calcTDEE, calcGoalTargets } from '@/utils/calorieCalc';
import { calcMacrosFromGoal } from '@/utils/macroCalc';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'expo-router';
import { Sparkle, Check } from 'phosphor-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { getDB } from '@/db';
import { AppSettings } from '@/types/user';

export default function Slide7Ready() {
  const { data } = useOnboarding();
  const router = useRouter();

  const targets = useMemo(() => {
    const bmr = calcBMR(data.gender, data.weight, data.height, data.age);
    const tdee = calcTDEE(bmr, data.activityLevel);
    const { dailyCalorieTarget } = calcGoalTargets(tdee, data.goalType);
    const macros = calcMacrosFromGoal(dailyCalorieTarget, data.goalType);

    return {
      calories: dailyCalorieTarget,
      macros
    };
  }, [data]);

  const handleStart = async () => {
    try {
      const db = await getDB()
      const defaultSettings: AppSettings = {
        notificationsEnabled: true,
        notif_meal_reminder: true,
        notif_calorie_alert: true,
        notif_water_reminder: true,
        notif_streak_warning: true,
        notif_weekly_summary: true,
        breakfast_time: '08:00',
        lunch_time: '12:30',
        dinner_time: '19:00',
        water_interval_hours: 2,
        water_start_time: '08:00',
        water_end_time: '22:00',
        weekly_summary_day: 'sunday',
        dataRetentionMonths: 12,
        healthConnected: false,
        mealReminderTimes: {
          breakfast: '08:00',
          lunch: '12:30',
          dinner: '19:00',
          snack: '16:00',
        },
      };

      // Önce kayıt var mı kontrol et
      const existing = await db.getFirstAsync('SELECT id FROM user WHERE id = 1')

      if (!existing) {
        // INSERT yap
        await db.runAsync(`
        INSERT INTO user (
          id, name, gender, age, height_cm, weight_kg, activity_level,
          goal, daily_calorie_goal, daily_protein_goal_g, daily_carbs_goal_g,
          daily_fat_goal_g, daily_budget_goal_tl, daily_step_goal,
          onboarding_completed
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
          data.name, data.gender, data.age, data.height, data.weight,
          data.activityLevel, JSON.stringify(data.goalType),
          targets.calories, targets.macros.protein, targets.macros.carbs,
          targets.macros.fat, 250, 8000
        )
      } else {
        // UPDATE yap
        const userStore = useUserStore.getState()
        await userStore.updateProfile({
          name: data.name, gender: data.gender, age: data.age,
          height: data.height, weight: data.weight, activityLevel: data.activityLevel,
        })
        await userStore.updateGoals({
          goalType: data.goalType, dailyCalorieTarget: targets.calories,
          macroTarget: targets.macros, dailyBudget: 250, stepGoal: 8000, exerciseCalorieGoal: 0,
        })
        await userStore.setOnboardingCompleted(true)
      }

      // Store'u güncelle
      useUserStore.setState({ onboardingCompleted: true })

      const { requestPermission, rescheduleAllNotifications } = await import('@/hooks/useNotifications');
      const hasNotificationPermission = await requestPermission();
      if (hasNotificationPermission) {
        await db.runAsync(`
          UPDATE user SET
            notif_meal_reminder = 1,
            notif_calorie_alert = 1,
            notif_water_reminder = 1,
            notif_streak_warning = 1,
            notif_weekly_summary = 1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = 1
        `);
        useUserStore.setState({ settings: defaultSettings });
        await rescheduleAllNotifications(defaultSettings);
      }

      router.replace("/(tabs)/daily/")
    } catch (error) {
      console.error("Failed to save onboarding data:", error)
    }
  }

  return (
    <SlideContainer
      nextButtonLabel="Hadi Başlayalım!"
      onNext={handleStart}
      gradientColors={['#E8F5E9', '#FAFAFA']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.animationContainer}>
              <View style={styles.successCircle}>
                <Check size={60} color={colors.surface} weight="bold" />
              </View>
            </View>

            <Text style={styles.title}>Her Şey Hazır!</Text>
            <Text style={styles.subtitle}>
              Size özel beslenme planınızı oluşturduk. İşte hedefleriniz:
            </Text>

            <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.resultCard}>
              <View style={styles.calorieResult}>
                <Text style={styles.resultLabel}>Günlük Kalori Hedefi</Text>
                <Text style={styles.calorieValue}>{targets.calories} <Text style={styles.kcal}>kcal</Text></Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: '#FF7043' }]} />
                  <Text style={styles.macroName}>Protein</Text>
                  <Text style={styles.macroValue}>{targets.macros.protein}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: '#42A5F5' }]} />
                  <Text style={styles.macroName}>Karbonhidrat</Text>
                  <Text style={styles.macroValue}>{targets.macros.carbs}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: '#66BB6A' }]} />
                  <Text style={styles.macroName}>Yağ</Text>
                  <Text style={styles.macroValue}>{targets.macros.fat}g</Text>
                </View>
              </View>
            </Animated.View>

            <View style={styles.tipBox}>
              <Sparkle size={20} color={colors.warning} weight="fill" />
              <Text style={styles.tipText}>
                Bu hedefleri istediğiniz zaman ayarlardan değiştirebilirsiniz.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SlideContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  animationContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontFamily: typography.fontExtraBold,
    fontSize: typography.xxxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: typography.fontRegular,
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  resultCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  calorieResult: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  calorieValue: {
    fontFamily: typography.fontExtraBold,
    fontSize: 40,
    color: colors.textPrimary,
  },
  kcal: {
    fontSize: typography.lg,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 20,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  macroName: {
    fontFamily: typography.fontMedium,
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  macroValue: {
    fontFamily: typography.fontBold,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  tipText: {
    flex: 1,
    fontFamily: typography.fontRegular,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: 12,
  }
});
