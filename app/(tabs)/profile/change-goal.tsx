import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useUserStore } from '@/stores/userStore';
import { GoalOption } from '@/components/onboarding/GoalOption';
import { ActivityLevelOption } from '@/components/onboarding/ActivityLevelOption';
import { GoalType, ActivityLevel } from '@/types/user';
import { Couch, Bicycle, Barbell, Lightning } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { calcBMR, calcTDEE, calcGoalTargets } from '@/utils/calorieCalc';
import { calcMacrosFromGoal } from '@/utils/macroCalc';
import { Input } from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';

export default function ChangeGoalScreen() {
  const router = useRouter();
  const { profile, goals, updateGoals, isLoading } = useUserStore();

  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>(goals?.goalType || []);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>(profile?.activityLevel || ActivityLevel.SEDENTARY);
  const [useRecommended, setUseRecommended] = useState(true);

  // Manual targets
  const [manualCalorie, setManualCalorie] = useState(goals?.dailyCalorieTarget.toString() || '');
  const [manualProtein, setManualProtein] = useState(goals?.macroTarget.protein.toString() || '');
  const [manualCarbs, setManualCarbs] = useState(goals?.macroTarget.carbs.toString() || '');
  const [manualFat, setManualFat] = useState(goals?.macroTarget.fat.toString() || '');

  const goalsList = [
    { type: GoalType.LOSE_WEIGHT, label: 'Kilo Ver', emoji: '📉' },
    { type: GoalType.GAIN_WEIGHT, label: 'Kilo Al', emoji: '💪' },
    { type: GoalType.STAY_FIT, label: 'Formda Kal', emoji: '🧘' },
    { type: GoalType.EAT_HEALTHIER, label: 'Sağlıklı Beslen', emoji: '🥗' },
    { type: GoalType.REDUCE_SPENDING, label: 'Tasarruf Et', emoji: '💰' },
  ];

  const activityLevels = [
    {
      type: ActivityLevel.SEDENTARY,
      title: 'Hareketsiz',
      description: 'Masa başı iş, az veya hiç egzersiz.',
      icon: Couch
    },
    {
      type: ActivityLevel.LIGHTLY_ACTIVE,
      title: 'Az Hareketli',
      description: 'Hafif egzersiz, haftada 1-3 gün.',
      icon: Bicycle
    },
    {
      type: ActivityLevel.MODERATELY_ACTIVE,
      title: 'Orta Hareketli',
      description: 'Düzenli egzersiz, haftada 3-5 gün.',
      icon: Barbell
    },
    {
      type: ActivityLevel.VERY_ACTIVE,
      title: 'Çok Hareketli',
      description: 'Ağır egzersiz veya fiziksel iş.',
      icon: Lightning
    },
  ];

  const toggleGoal = (goal: GoalType) => {
    // Only one weight-related goal at a time for calculation simplicity in recommendations
    if (goal === GoalType.LOSE_WEIGHT || goal === GoalType.GAIN_WEIGHT || goal === GoalType.STAY_FIT) {
      setSelectedGoals(prev => {
        const filtered = prev.filter(g => g !== GoalType.LOSE_WEIGHT && g !== GoalType.GAIN_WEIGHT && g !== GoalType.STAY_FIT);
        return [...filtered, goal];
      });
    } else {
      setSelectedGoals(prev =>
        prev.includes(goal)
          ? prev.filter(g => g !== goal)
          : [...prev, goal]
      );
    }
  };

  const recommendedTargets = React.useMemo(() => {
    if (!profile) return null;
    const bmr = calcBMR(profile.gender, profile.weight, profile.height, profile.age);
    const tdee = calcTDEE(bmr, selectedActivity);
    const calTarget = calcGoalTargets(tdee, selectedGoals);
    const macroTarget = calcMacrosFromGoal(calTarget.dailyCalorieTarget, selectedGoals);

    return {
      calories: calTarget.dailyCalorieTarget,
      protein: macroTarget.protein,
      carbs: macroTarget.carbs,
      fat: macroTarget.fat
    };
  }, [profile, selectedActivity, selectedGoals]);

  const handleSave = async () => {
    if (!goals || !profile) return;

    let newGoals = { ...goals };
    newGoals.goalType = selectedGoals;

    if (useRecommended && recommendedTargets) {
      newGoals.dailyCalorieTarget = recommendedTargets.calories;
      newGoals.macroTarget = {
        protein: recommendedTargets.protein,
        carbs: recommendedTargets.carbs,
        fat: recommendedTargets.fat
      };
    } else {
      newGoals.dailyCalorieTarget = parseInt(manualCalorie) || goals.dailyCalorieTarget;
      newGoals.macroTarget = {
        protein: parseInt(manualProtein) || goals.macroTarget.protein,
        carbs: parseInt(manualCarbs) || goals.macroTarget.carbs,
        fat: parseInt(manualFat) || goals.macroTarget.fat
      };
    }

    try {
      await updateGoals(newGoals);
      // We also update activity level in profile since it affects TDEE
      const { updateProfile } = useUserStore.getState();
      await updateProfile({ activityLevel: selectedActivity });

      Alert.alert('Başarılı', 'Hedefleriniz güncellendi.');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Hedefler güncellenirken bir hata oluştu.');
    }
  };

  if (isLoading || !profile || !goals) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Hedefi Değiştir</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ana Hedefiniz</Text>
          <View style={styles.goalsGrid}>
            {goalsList.map((goal) => (
              <GoalOption
                key={goal.type}
                label={goal.label}
                emoji={goal.emoji}
                isSelected={selectedGoals.includes(goal.type)}
                onPress={() => toggleGoal(goal.type)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hareket Seviyeniz</Text>
          <View style={styles.activityList}>
            {activityLevels.map((level) => {
              const Icon = level.icon;
              return (
                <ActivityLevelOption
                  key={level.type}
                  title={level.title}
                  description={level.description}
                  icon={<Icon size={24} color={selectedActivity === level.type ? colors.primary : colors.textSecondary} />}
                  isSelected={selectedActivity === level.type}
                  onPress={() => setSelectedActivity(level.type)}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.sectionTitle}>Hedef Değerler</Text>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>{useRecommended ? 'Önerilen' : 'Manuel'}</Text>
              <Switch
                value={!useRecommended}
                onValueChange={(val) => setUseRecommended(!val)}
                trackColor={{ false: colors.primary, true: colors.accent }}
              />
            </View>
          </View>

          {useRecommended ? (
            <View style={styles.recommendedBox}>
              <View style={styles.recommendRow}>
                <Text style={styles.recommendLabel}>Kalori</Text>
                <Text style={styles.recommendValue}>{recommendedTargets?.calories} kcal</Text>
              </View>
              <View style={styles.recommendRow}>
                <Text style={styles.recommendLabel}>Protein</Text>
                <Text style={styles.recommendValue}>{recommendedTargets?.protein} g</Text>
              </View>
              <View style={styles.recommendRow}>
                <Text style={styles.recommendLabel}>Karbonhidrat</Text>
                <Text style={styles.recommendValue}>{recommendedTargets?.carbs} g</Text>
              </View>
              <View style={styles.recommendRow}>
                <Text style={styles.recommendLabel}>Yağ</Text>
                <Text style={styles.recommendValue}>{recommendedTargets?.fat} g</Text>
              </View>
            </View>
          ) : (
            <View style={styles.manualForm}>
              <Input
                label="Günlük Kalori"
                keyboardType="numeric"
                value={manualCalorie}
                onChangeText={setManualCalorie}
              />
              <View style={styles.manualGrid}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Protein (g)"
                    keyboardType="numeric"
                    value={manualProtein}
                    onChangeText={setManualProtein}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Karh. (g)"
                    keyboardType="numeric"
                    value={manualCarbs}
                    onChangeText={setManualCarbs}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Yağ (g)"
                    keyboardType="numeric"
                    value={manualFat}
                    onChangeText={setManualFat}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        <Button
          label="Hedefleri Güncelle"
          onPress={handleSave}
          style={styles.saveButton}
          fullWidth
        />
        <View style={{ height: 40 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  goalsGrid: {
    gap: 8,
  },
  activityList: {
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: typography.fontSemiBold,
    color: colors.textSecondary,
  },
  recommendedBox: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  recommendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight + '40',
  },
  recommendLabel: {
    fontSize: 14,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
  },
  recommendValue: {
    fontSize: 16,
    fontFamily: typography.fontBold,
    color: colors.primaryDark,
  },
  manualForm: {
    gap: 16,
  },
  manualGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    marginTop: 8,
  },
});
