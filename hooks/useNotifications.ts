import { AppSettings } from '@/types/user';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const Notifications = isExpoGo ? null : require('expo-notifications');
const SchedulableTriggerInputTypes = isExpoGo
  ? {}
  : require('expo-notifications').SchedulableTriggerInputTypes;

if (!isExpoGo && Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

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
  if (isExpoGo) {
    console.warn('[Notifications] Notifications are not supported in Expo Go. Please use a development build.');
    return false;
  }

  try {
    if (!Notifications) return false;
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
  if (isExpoGo) {
    console.warn('[Notifications] Cannot schedule meal reminders in Expo Go.');
    return;
  }

  try {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync('meal-reminder-breakfast');
    await Notifications.cancelScheduledNotificationAsync('meal-reminder-lunch');
    await Notifications.cancelScheduledNotificationAsync('meal-reminder-dinner');

    if (!settings.notif_meal_reminder) return;
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

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
  if (isExpoGo) {
    console.warn('[Notifications] Cannot schedule water reminders in Expo Go.');
    return;
  }

  try {
    if (!Notifications) return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const waterReminders = scheduled.filter((n: any) => n.identifier.startsWith('water-reminder-'));
    for (const n of waterReminders) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }

    if (!settings.notif_water_reminder) return;
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

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
  if (isExpoGo) {
    console.warn('[Notifications] Cannot schedule streak warning in Expo Go.');
    return;
  }

  try {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync('streak-warning');
    if (!settings.notif_streak_warning) return;
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

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
  if (isExpoGo) {
    console.warn('[Notifications] Cannot schedule weekly summary in Expo Go.');
    return;
  }

  try {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync('weekly-summary');
    if (!settings.notif_weekly_summary) return;
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

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
  if (isExpoGo) {
    console.warn('[Notifications] Cannot trigger calorie alert in Expo Go.');
    return;
  }

  try {
    if (!Notifications) return;
    const { useUserStore } = await import('@/stores/userStore');
    const settings = useUserStore.getState().settings;
    if (!settings?.notif_calorie_alert) return;

    const percent = consumed / goal;

    if (percent >= 1.0 && percent < 1.05) {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Hedefe ulaştın!',
          body: "Günlük kalori hedefine ulaştın!",
        },
        trigger: null,
      });

    } else if (percent >= 1.05) {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Kalori hedefi aşıldı',
          body: "Günlük limitini geçtin.",
        },
        trigger: null,
      });

    } else if (percent >= 0.9) {
      const remaining = Math.round(goal - consumed);
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

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

export async function triggerRecipeCalculatedNotification({
  recipeName,
  totalCalories,
  totalCost,
  recipeId,
}: {
  recipeName: string;
  totalCalories: number | null;
  totalCost: number | null;
  recipeId?: string;
}) {
  if (isExpoGo) {
    console.warn('[Notifications] Recipe calculated notification skipped in Expo Go.');
    return;
  }

  const calStr = totalCalories ? `${Math.round(totalCalories)} kcal` : 'Kalori hesaplanamadı';
  const costStr = totalCost ? `₺${totalCost.toFixed(2)}` : 'Fiyat hesaplanamadı';

  try {
    if (!Notifications) return;
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `✅ "${recipeName}" hesaplandı`,
        body: `${calStr} · ${costStr} — Detaylar için dokunun.`,
        data: { recipeName, recipeId },
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('[Notifications] triggerRecipeCalculatedNotification failed:', error);
  }
}

export async function cancelAll() {
  try {
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('[Notifications] cancelAll failed:', error);
  }
}

export async function scheduleAll(settings: AppSettings) {
  if (isExpoGo) {
    console.warn('[Notifications] Cannot schedule all notifications in Expo Go.');
    return;
  }
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
  if (isExpoGo) {
    console.warn('[Notifications] Notifications are not supported in Expo Go. Please use a development build.');
    return {
      requestPermission: async () => false,
      scheduleMealReminders: async () => { },
      scheduleWaterReminders: async () => { },
      scheduleStreakWarning: async () => { },
      scheduleWeeklySummary: async () => { },
      triggerCalorieAlert: async () => { },
      triggerRecipeCalculatedNotification: async () => { },
      scheduleAll: async () => { },
      cancelAll: async () => { },
    };
  }
  return {
    requestPermission,
    scheduleMealReminders,
    scheduleWaterReminders,
    scheduleStreakWarning,
    scheduleWeeklySummary,
    triggerCalorieAlert,
    triggerRecipeCalculatedNotification,
    scheduleAll,
    cancelAll,
  };
}
