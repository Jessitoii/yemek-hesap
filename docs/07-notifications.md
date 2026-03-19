# 07 — Notifications

## Overview

KaloriTabak uses **expo-notifications** for all notifications. All notifications are **local** — no push notification server required. Notifications are scheduled on-device and fire without any internet connection.

---

## Notification Types

### 1. Meal Reminders
Reminds the user to log their meals at configured times.

**Trigger:** Scheduled daily at user-configured times
**Default times:** 08:00 (breakfast), 12:30 (lunch), 19:00 (dinner)
**Condition:** Only fires if the meal has not been logged yet for that day

```
Title:   "🍳 Breakfast time!"
Body:    "Don't forget to log your breakfast."

Title:   "🥗 Lunch time!"
Body:    "Have you logged your lunch yet?"

Title:   "🍽️ Dinner time!"
Body:    "Time to log your dinner."
```

**User control:**
- Toggle on/off per meal type (breakfast / lunch / dinner separately)
- Change time per meal type
- Configurable from Profile → Settings

---

### 2. Daily Calorie Goal Alerts

**Trigger A — Goal Reached (90%+)**
Fires when logged calories reach 90% of daily goal.

```
Title:   "🎯 Almost there!"
Body:    "You've reached 90% of your daily calorie goal. 200 kcal remaining."
```

**Trigger B — Goal Exceeded**
Fires when logged calories exceed daily goal.

```
Title:   "⚠️ Calorie goal exceeded"
Body:    "You've gone over your daily limit. Consider lighter options for the rest of the day."
```

**Trigger C — Goal Exactly Hit**
Fires when logged calories hit 100% of goal (within ±10 kcal).

```
Title:   "🎉 Goal reached!"
Body:    "Perfect! You've hit your daily calorie goal exactly. Great job!"
```

**User control:**
- Toggle all calorie alerts on/off from Profile → Settings

---

### 3. Water Reminders
Reminds the user to drink water at regular intervals during active hours.

**Trigger:** Repeating interval during configured active hours
**Default:** Every 2 hours between 08:00 and 22:00

```
Title:   "💧 Time to drink water!"
Body:    "Staying hydrated helps your metabolism. Have a glass of water!"
```

**User control:**
- Toggle on/off
- Set interval (1h / 1.5h / 2h / 3h)
- Set active window start and end time
- Configurable from Profile → Settings

---

### 4. Streak Warning
Reminds the user to complete their daily goal before the day ends.

**Trigger:** Scheduled daily at a configurable time (default 21:00)
**Condition:** Only fires if today's goal has NOT been completed

```
Title:   "🔥 Don't break your streak!"
Body:    "You haven't completed today's goal yet. X days streak at risk!"
```

If user has no active streak (streak = 0):
```
Title:   "💪 Start your streak today!"
Body:    "Log your meals and hit your goal to start a new streak."
```

**User control:**
- Toggle on/off
- Change warning time
- Configurable from Profile → Settings

---

### 5. Weekly Summary
Sends a summary of the user's week every Sunday (or user-configured day).

**Trigger:** Scheduled weekly on user-configured day at 20:00

```
Title:   "📊 Your weekly summary is ready"
Body:    "This week: 14,230 kcal consumed · ₺342.50 spent · 7-day streak 🔥"
```

If it was a good week (all goals met):
```
Title:   "📊 What a week! 🌟"
Body:    "You hit your goals every day this week. Check out your full summary!"
```

**User control:**
- Toggle on/off
- Change summary day (Monday – Sunday)
- Configurable from Profile → Settings

---

## Technical Implementation

### Setup

```typescript
// hooks/useNotifications.ts

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// Must be called at app root (_layout.tsx)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})
```

### Scheduling Meal Reminders

```typescript
// Schedule a daily repeating notification at a specific time
async function scheduleMealReminder(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  hour: number,
  minute: number
) {
  // Cancel existing notification for this meal type first
  await cancelMealReminder(mealType)

  await Notifications.scheduleNotificationAsync({
    identifier: `meal-reminder-${mealType}`,
    content: {
      title: getMealTitle(mealType),
      body: getMealBody(mealType),
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  })
}

async function cancelMealReminder(mealType: string) {
  await Notifications.cancelScheduledNotificationAsync(
    `meal-reminder-${mealType}`
  )
}
```

### Scheduling Water Reminders

```typescript
async function scheduleWaterReminders(
  intervalHours: number,
  startHour: number,
  endHour: number
) {
  // Cancel all existing water reminders
  await cancelWaterReminders()

  const slots: number[] = []
  let current = startHour
  while (current < endHour) {
    slots.push(current)
    current += intervalHours
  }

  for (const hour of slots) {
    await Notifications.scheduleNotificationAsync({
      identifier: `water-reminder-${hour}`,
      content: {
        title: '💧 Time to drink water!',
        body: 'Staying hydrated helps your metabolism. Have a glass of water!',
      },
      trigger: {
        hour,
        minute: 0,
        repeats: true,
      },
    })
  }
}
```

### Scheduling Streak Warning

```typescript
async function scheduleStreakWarning(hour: number, minute: number) {
  await Notifications.cancelScheduledNotificationAsync('streak-warning')

  await Notifications.scheduleNotificationAsync({
    identifier: 'streak-warning',
    content: {
      title: "🔥 Don't break your streak!",
      body: "You haven't completed today's goal yet.",
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  })
}
```

### Scheduling Weekly Summary

```typescript
const DAY_MAP: Record<string, number> = {
  sunday: 1, monday: 2, tuesday: 3, wednesday: 4,
  thursday: 5, friday: 6, saturday: 7,
}

async function scheduleWeeklySummary(day: string) {
  await Notifications.cancelScheduledNotificationAsync('weekly-summary')

  await Notifications.scheduleNotificationAsync({
    identifier: 'weekly-summary',
    content: {
      title: '📊 Your weekly summary is ready',
      body: 'Tap to see how your week went.',
    },
    trigger: {
      weekday: DAY_MAP[day],
      hour: 20,
      minute: 0,
      repeats: true,
    },
  })
}
```

### Calorie Alert (Triggered in-app, not scheduled)

```typescript
// Called from dailyStore when totals are updated
async function triggerCalorieAlert(
  consumed: number,
  goal: number
) {
  const percent = consumed / goal

  if (percent >= 1.0 && percent < 1.05) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Goal reached!',
        body: "Perfect! You've hit your daily calorie goal. Great job!",
      },
      trigger: null, // fires immediately
    })
  } else if (percent > 1.05) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Calorie goal exceeded',
        body: "You've gone over your daily limit.",
      },
      trigger: null,
    })
  } else if (percent >= 0.9) {
    const remaining = Math.round(goal - consumed)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Almost there!',
        body: `${remaining} kcal remaining to hit your goal.`,
      },
      trigger: null,
    })
  }
}
```

---

## Notification Identifiers

All notifications use stable string identifiers so they can be cancelled and rescheduled cleanly:

| Notification | Identifier |
|---|---|
| Breakfast reminder | `meal-reminder-breakfast` |
| Lunch reminder | `meal-reminder-lunch` |
| Dinner reminder | `meal-reminder-dinner` |
| Water reminder (per slot) | `water-reminder-{hour}` |
| Streak warning | `streak-warning` |
| Weekly summary | `weekly-summary` |
| Calorie alerts | No identifier (fire-and-forget) |

---

## Re-scheduling on Settings Change

Whenever the user changes notification settings in Profile → Settings, all affected notifications are cancelled and rescheduled immediately:

```typescript
// Called from userStore when settings are saved
async function rescheduleAllNotifications(settings: AppSettings) {
  if (settings.notif_meal_reminder) {
    await scheduleMealReminder('breakfast', ...parseTime(settings.breakfast_time))
    await scheduleMealReminder('lunch',     ...parseTime(settings.lunch_time))
    await scheduleMealReminder('dinner',    ...parseTime(settings.dinner_time))
  } else {
    await cancelMealReminder('breakfast')
    await cancelMealReminder('lunch')
    await cancelMealReminder('dinner')
  }

  if (settings.notif_water_reminder) {
    await scheduleWaterReminders(
      settings.water_interval_hours,
      ...parseTime(settings.water_start_time),
      ...parseTime(settings.water_end_time)
    )
  } else {
    await cancelWaterReminders()
  }

  if (settings.notif_streak_warning) {
    await scheduleStreakWarning(21, 0)
  } else {
    await Notifications.cancelScheduledNotificationAsync('streak-warning')
  }

  if (settings.notif_weekly_summary) {
    await scheduleWeeklySummary(settings.weekly_summary_day)
  } else {
    await Notifications.cancelScheduledNotificationAsync('weekly-summary')
  }
}
```

---

## Platform Notes

- **iOS:** Permission prompt shown on first notification schedule. User must grant permission. If denied, notifications silently fail — handle gracefully with an in-app banner.
- **Android:** Notifications work without explicit permission on Android 12 and below. Android 13+ requires `POST_NOTIFICATIONS` permission — expo-notifications handles this automatically.
- **Background:** All notifications are local and scheduled — no background processing needed. The device OS fires them at the right time.
