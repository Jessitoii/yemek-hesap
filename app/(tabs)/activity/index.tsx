import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "../../../constants/colors";
import { typography } from "../../../constants/typography";
import { shadow } from "../../../constants/theme";
import { BurnedCaloriesRing } from '../../../components/activity/BurnedCaloriesRing';
import { StepsCard } from '../../../components/activity/StepsCard';
import { ExerciseCard } from '../../../components/activity/ExerciseCard';
import { Button } from '../../../components/ui/Button';
import { useUserStore } from '../../../stores/userStore';
import { useActivityStore } from '../../../stores/activityStore';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDailyStore } from '../../../stores/dailyStore';
import { usePedometer } from '../../../hooks/usePedometer';

export default function ActivityScreen() {
  const { profile, goals, isLoading } = useUserStore();
  const { exercises, streak, loadActivity, deleteExercise, updateSteps } = useActivityStore();
  const todayLog = useDailyStore(state => state.todayLog);
  const { steps: pedometerSteps, isAvailable: pedometerAvailable } = usePedometer();
  const [stepsSource, setStepsSource] = useState<string>('Pedometer');

  useEffect(() => {
    const fetchActivity = async () => {
      await loadActivity(new Date().toISOString().split('T')[0]);

      // Önce Health Connect'i dene (Android'de gün başından itibaren adım)
      try {
        const { requestHealthPermissions, getTodaySteps } = await import('../../../services/health');
        const isGranted = await requestHealthPermissions();
        if (isGranted) {
          const healthSteps = await getTodaySteps();
          if (healthSteps > 0) {
            await updateSteps(healthSteps);
            setStepsSource('Health Connect');
            return;
          }
        }
      } catch {
        // Health Connect yok veya hata → pedometer'a düş
      }

      setStepsSource(pedometerAvailable ? 'Pedometer' : 'Manuel');
    };

    fetchActivity();
  }, []);

  // Pedometer güncellenince store'a yaz (Health Connect yoksa)
  useEffect(() => {
    if (!pedometerAvailable || pedometerSteps === 0) return;
    if (stepsSource === 'Health Connect') return; // Health Connect varsa dokunma
    updateSteps(pedometerSteps);
  }, [pedometerSteps]);
  if (isLoading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
  // ─── Profil eksikse yönlendir ───────────────────────────────────────────
  const isProfileIncomplete = !profile?.weight || !profile?.height;
  if (isProfileIncomplete) {
    return (
      <View style={styles.container}>
        <View style={styles.warningContainer}>
          <MaterialCommunityIcons name="account-alert" size={64} color={colors.accent} />
          <Text style={styles.warningTitle}>Profilini Tamamla</Text>
          <Text style={styles.warningText}>
            Kalori hesaplamalarının doğru yapılabilmesi için boy ve kilo bilgilerini girmelisin.
          </Text>
          <Button
            label="Profiline Git"
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.profileButton}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  // Health Connect > DB > Pedometer
  const displaySteps = stepsSource === 'Health Connect'
    ? (todayLog?.stepCount ?? 0)
    : pedometerSteps > 0
      ? pedometerSteps
      : (todayLog?.stepCount ?? 0);

  const stepGoal = goals?.stepGoal || 10000;
  const calorieGoal = goals?.exerciseCalorieGoal || 500;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Aktivite</Text>

        <BurnedCaloriesRing
          burned={todayLog?.burnedCalories || 0}
          goal={calorieGoal}
        />

        <StepsCard
          steps={displaySteps}
          goal={stepGoal}
        />

        {stepsSource !== 'Health Connect' && (
          <View style={styles.healthConnectInfo}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.healthConnectText}>
              Gün başından itibaren adımlarını görmek için Profil {'>'} Sağlık Uygulaması bölümünden Health Connect'i bağla.{' '}
              <Text
                style={styles.healthConnectLink}
                onPress={() => router.push('/(tabs)/profile')}
              >
                Bağla
              </Text>
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bugünkü Egzersizler</Text>
          <TouchableOpacity onPress={() => router.push('/activity/add-exercise')}>
            <Text style={styles.addLink}>+ Ekle</Text>
          </TouchableOpacity>
        </View>

        {exercises.length > 0 ? (
          exercises.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} onDelete={deleteExercise} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz egzersiz eklemedin.</Text>
          </View>
        )}

        <View style={styles.streakSection}>
          <View style={styles.streakHeader}>
            <Text style={styles.sectionTitle}>Aktivite Serisi</Text>
            <TouchableOpacity onPress={() => router.push('/activity/streak')}>
              <Text style={styles.addLink}>Takvimi Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.streakInfo}>
            <MaterialCommunityIcons name="fire" size={32} color={colors.accent} />
            <Text style={styles.streakText}>{streak} Günlük Seri!</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/activity/add-exercise')}>
        <MaterialCommunityIcons name="plus" size={32} color={colors.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 100 },
  headerTitle: { fontFamily: typography.fontBold, fontSize: typography.xxl, color: colors.textPrimary, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontFamily: typography.fontBold, fontSize: typography.lg, color: colors.textPrimary },
  addLink: { fontFamily: typography.fontBold, fontSize: typography.sm, color: colors.primary },
  emptyContainer: { padding: 32, backgroundColor: colors.surface, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  emptyText: { fontFamily: typography.fontRegular, fontSize: typography.base, color: colors.textSecondary },
  warningContainer: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  warningTitle: { fontFamily: typography.fontBold, fontSize: typography.xl, color: colors.textPrimary, marginTop: 20, marginBottom: 12 },
  warningText: { fontFamily: typography.fontRegular, fontSize: typography.base, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  profileButton: { width: '100%' },
  streakSection: { marginTop: 32 },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  streakInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, ...shadow.sm },
  streakText: { fontFamily: typography.fontBold, fontSize: typography.lg, color: colors.textPrimary, marginLeft: 12 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadow.md },
  healthConnectInfo: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  healthConnectText: {
    fontFamily: typography.fontRegular,
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  healthConnectLink: {
    fontFamily: typography.fontBold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
