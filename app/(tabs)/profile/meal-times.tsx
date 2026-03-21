import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useUserStore } from '@/stores/userStore';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { useNotifications } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MealTimesScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useUserStore();
  const notifications = useNotifications();

  const [showPicker, setShowPicker] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);

  if (!settings) return null;

  const getMealTime = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    // We favor the flat fields if they exist, otherwise the nested ones
    if (meal === 'breakfast') return settings.breakfast_time || settings.mealReminderTimes.breakfast;
    if (meal === 'lunch') return settings.lunch_time || settings.mealReminderTimes.lunch;
    if (meal === 'dinner') return settings.dinner_time || settings.mealReminderTimes.dinner;
    return '08:00';
  };

  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleTimeChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    
    if (event.type === 'set' && selectedDate && currentMeal) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      const updateKey = `${currentMeal}_time`;
      const updatedSettings = { ...settings, [updateKey]: timeStr };
      
      // Update store
      await updateSettings({ [updateKey]: timeStr });
      
      // Reschedule all notifications
      await notifications.scheduleAll(updatedSettings);
    }

    
    setCurrentMeal(null);
  };

  const openPicker = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    setCurrentMeal(meal);
    setShowPicker(true);
  };

  const meals = [
    { key: 'breakfast', label: 'Kahvaltı' },
    { key: 'lunch', label: 'Öğle Yemeği' },
    { key: 'dinner', label: 'Akşam Yemeği' },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Öğün Zamanları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileSection title="Hatırlatıcı Saatleri">
          <Text style={styles.sectionDesc}>
            Öğünlerinizi planlamak ve hatırlatıcı almak istediğiniz saatleri ayarlayın.
          </Text>

          {meals.map((meal, index) => (
            <React.Fragment key={meal.key}>
              <View style={styles.mealRow}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealLabel}>{meal.label}</Text>
                  <Text style={styles.mealTime}>{getMealTime(meal.key)}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.changeButton} 
                  onPress={() => openPicker(meal.key)}
                >
                  <Text style={styles.changeButtonText}>Değiştir</Text>
                </TouchableOpacity>
              </View>
              {index < meals.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </ProfileSection>

        {showPicker && currentMeal && (
          <DateTimePicker
            value={parseTimeString(getMealTime(currentMeal))}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  sectionDesc: {
    fontSize: 14,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 16,
    fontFamily: typography.fontSemiBold,
    color: colors.textPrimary,
  },
  mealTime: {
    fontSize: 14,
    fontFamily: typography.fontMedium,
    color: colors.primaryDark,
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  changeButtonText: {
    fontSize: 14,
    fontFamily: typography.fontSemiBold,
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
