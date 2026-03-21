import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from "../../../constants/colors";
import { typography } from "../../../constants/typography";
import { ExerciseTypeGrid } from '../../../components/activity/ExerciseTypeGrid';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ExerciseType, exercises as ExerciseListData } from '../../../constants/exercises';
import { useUserStore } from '../../../stores/userStore';
import { useActivityStore } from '../../../stores/activityStore';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddExerciseScreen() {
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [calculatedCalories, setCalculatedCalories] = useState(0);

  const { profile } = useUserStore();
  const { addExercise } = useActivityStore();

  useEffect(() => {
    if (selectedType && duration && profile?.weight) {
      const exercise = ExerciseListData.find(e => e.type === selectedType);
      if (exercise) {
        const mins = parseInt(duration) || 0;
        const calories = Math.round(exercise.met * profile.weight * (mins / 60));
        setCalculatedCalories(calories);
      }
    } else {
      setCalculatedCalories(0);
    }
  }, [selectedType, duration, profile?.weight]);

  const handleSave = async () => {
    if (!selectedType || !duration) return;

    const exercise = ExerciseListData.find(e => e.type === selectedType);
    if (!exercise) return;

    await addExercise({
      type: selectedType,
      name: exercise.name,
      durationMinutes: parseInt(duration),
      burnedCalories: calculatedCalories,
      notes: notes || undefined,
    });

    router.back();
  };

  const isSaveDisabled = !selectedType || !duration || parseInt(duration) <= 0;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Egzersiz Ekle</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Egzersiz Tipi</Text>
            <ExerciseTypeGrid selectedType={selectedType} onSelect={setSelectedType} />
          </View>

          <View style={styles.inputsSection}>
            <Input
              label="Süre (Dakika)"
              placeholder="Örn: 30"
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              leftIcon={<MaterialCommunityIcons name="clock-outline" size={20} color={colors.textSecondary} />}
            />

            {calculatedCalories > 0 && (
              <View style={styles.caloriesPreview}>
                <View style={styles.caloriesIconContainer}>
                  <MaterialCommunityIcons name="fire" size={24} color={colors.pink} />
                </View>
                <View style={styles.caloriesInfo}>
                  <Text style={styles.caloriesText}>
                    {calculatedCalories} kcal yakılacak
                  </Text>
                  <Text style={styles.caloriesSubtext}>
                    ({profile?.weight} kg profilinize göre hesaplandı)
                  </Text>
                </View>
              </View>
            )}

            <Input
              label="Notlar (Opsiyonel)"
              placeholder="Egzersiz hakkında not al..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <Button
            label="Kaydet"
            onPress={handleSave}
            disabled={isSaveDisabled}
            style={styles.saveButton}
            variant="primary"
          />
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
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: typography.fontBold,
    fontSize: typography.xl,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: typography.base,
    color: colors.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  inputsSection: {
    marginBottom: 32,
  },
  caloriesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pinkLight,
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
  },
  caloriesIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  caloriesInfo: {
    flex: 1,
  },
  caloriesText: {
    fontFamily: typography.fontBold,
    fontSize: typography.base,
    color: colors.pinkDark,
  },
  caloriesSubtext: {
    fontFamily: typography.fontRegular,
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 40,
  },
});
