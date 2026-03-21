import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { AppSettings } from '@/types/user';

const DAY_MAP: Record<string, number> = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
};

export async function requestPermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('[Notifications] Error requesting permission:', error);
    return false;
  }
}

const getMealTitle = (mealType: string) => {
  switch (mealType) {
    case 'breakfast': return '🍳 Kahvaltı vakti!';
    case 'lunch': return '🥗 Öğle yemeği vakti!';
    case 'dinner': return '🍽️ Akşam yemeği vakti!';
    default: return '🍴 Yemek vakti!';
  }
};


const getMealBody = (mealType: string) => {
  switch (mealType) {
    case 'breakfast': return "Kahvaltını loglamayı unutma.";
    case 'lunch': return "Öğle yemeğini logladın mı?";
    case 'dinner': return "Akşam yemeğini loglama zamanı.";
    default: return "Öğününü loglamayı unutma.";
  }
};


const parseTime = (timeStr: string): [number, number] => {
  if (!timeStr) return [0, 0];
  const [h, m] = timeStr.split(':').map(Number);
  return [h || 0, m || 0];
};

export async function scheduleMealReminders(settings: AppSettings) {
  try {
    await Notifications.cancelScheduledNotificationAsync('meal-reminder-breakfast');
    await Notifications.cancelScheduledNotificationAsync('meal-reminder-lunch');
    await Notifications.cancelScheduledNotificationAsync('meal-reminder-dinner');

    if (!settings.notif_meal_reminder) return;

    const meals: Array<{ type: 'breakfast' | 'lunch' | 'dinner'; time: string }> = [
      { type: 'breakfast', time: settings.breakfast_time },
      { type: 'lunch', time: settings.lunch_time },
      { type: 'dinner', time: settings.dinner_time },
    ];

    for (const meal of meals) {
      if (!meal.time) continue;
      const [hour, minute] = parseTime(meal.time);
      await Notifications.scheduleNotificationAsync({
        identifier: `meal-reminder-${meal.type}`,
        content: {
          title: getMealTitle(meal.type),
          body: getMealBody(meal.type),
        },
        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        },
      });
    }
  } catch (error) {
    console.warn('[Notifications] scheduleMealReminders failed:', error);
  }
}

export async function scheduleWaterReminders(settings: AppSettings) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const waterReminders = scheduled.filter((n: Notifications.NotificationRequest) => n.identifier.startsWith('water-reminder-'));
    for (const n of waterReminders) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }

    if (!settings.notif_water_reminder) return;

    const intervalHours = settings.water_interval_hours || 2;
    const [startHour] = parseTime(settings.water_start_time || '08:00');
    const [endHour] = parseTime(settings.water_end_time || '22:00');

    let current = startHour;
    while (current <= endHour) {
      await Notifications.scheduleNotificationAsync({
        identifier: `water-reminder-${current}`,
        content: {
          title: '💧 Su içme vakti!',
          body: 'Metabolizman için bir bardak su iç!',
        },

        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR,
          hour: current,
          minute: 0,
          repeats: true,
        },
      });
      current += intervalHours;
    }
  } catch (error) {
    console.warn('[Notifications] scheduleWaterReminders failed:', error);
  }
}

export async function scheduleStreakWarning(settings: AppSettings) {
  try {
    await Notifications.cancelScheduledNotificationAsync('streak-warning');
    if (!settings.notif_streak_warning) return;

    await Notifications.scheduleNotificationAsync({
      identifier: 'streak-warning',
      content: {
        title: "🔥 Serini kırma!",
        body: "Bugünkü hedefini henüz tamamlamadın.",
      },

      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour: 21,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.warn('[Notifications] scheduleStreakWarning failed:', error);
  }
}

export async function scheduleWeeklySummary(settings: AppSettings) {
  try {
    await Notifications.cancelScheduledNotificationAsync('weekly-summary');
    if (!settings.notif_weekly_summary) return;

    const day = settings.weekly_summary_day?.toLowerCase() || 'sunday';
    const weekday = DAY_MAP[day] || 1;

    await Notifications.scheduleNotificationAsync({
      identifier: 'weekly-summary',
      content: {
        title: '📊 Haftalık özetin hazır',
        body: 'Bu haftaya bir göz at!',
      },

      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        weekday,
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.warn('[Notifications] scheduleWeeklySummary failed:', error);
  }
}

export async function triggerCalorieAlert(consumed: number, goal: number) {
  try {
    const { useUserStore } = await import('@/stores/userStore');
    const settings = useUserStore.getState().settings;
    if (!settings?.notif_calorie_alert) return;

    const percent = consumed / goal;

    if (percent >= 1.0 && percent < 1.05) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Hedefe ulaştın!',
          body: "Günlük kalori hedefine ulaştın!",
        },
        trigger: null,
      });

    } else if (percent >= 1.05) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Kalori hedefi aşıldı',
          body: "Günlük limitini geçtin.",
        },
        trigger: null,
      });

    } else if (percent >= 0.9) {
      const remaining = Math.round(goal - consumed);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Neredeyse ulaştın!',
          body: `${remaining} kcal daha kaldı.`,
        },
        trigger: null,
      });

    }
  } catch (error) {
    console.warn('[Notifications] triggerCalorieAlert failed:', error);
  }
}

export async function cancelAll() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('[Notifications] cancelAll failed:', error);
  }
}

export async function scheduleAll(settings: AppSettings) {
  try {
    await cancelAll();
    if (!settings.notificationsEnabled) return;

    await scheduleMealReminders(settings);
    await scheduleWaterReminders(settings);
    await scheduleStreakWarning(settings);
    await scheduleWeeklySummary(settings);
  } catch (error) {
    console.warn('[Notifications] scheduleAll failed:', error);
  }
}

export function useNotifications() {
  return {
    requestPermission,
    scheduleMealReminders,
    scheduleWaterReminders,
    scheduleStreakWarning,
    scheduleWeeklySummary,
    triggerCalorieAlert,
    scheduleAll,
    cancelAll,
  };
}
