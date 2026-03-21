import { getDB } from '../index';
import { UserProfile, UserGoals, AppSettings, Gender, ActivityLevel, GoalType } from '../../types/user';

export async function getUser(): Promise<(UserProfile & UserGoals & AppSettings) | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>('SELECT * FROM user WHERE id = 1');
  if (!row) return null;

  return {
    name: row.name,
    gender: row.gender as Gender,
    age: row.age,
    height: row.height_cm,
    weight: row.weight_kg,
    activityLevel: row.activity_level as ActivityLevel,
    bodyFatPercentage: row.body_fat_percent,
    onboardingCompleted: row.onboarding_completed === 1,
    goalType: row.goal ? JSON.parse(row.goal) : [],
    dailyCalorieTarget: row.daily_calorie_goal,
    macroTarget: {
      protein: row.daily_protein_goal_g,
      carbs: row.daily_carbs_goal_g,
      fat: row.daily_fat_goal_g,
    },
    dailyBudget: row.daily_budget_goal_tl,
    stepGoal: row.daily_step_goal,
    exerciseCalorieGoal: 300, // default if not in DB
    notificationsEnabled: true, // simplified global flag
    notif_meal_reminder: row.notif_meal_reminder === 1,
    notif_calorie_alert: row.notif_calorie_alert === 1,
    notif_water_reminder: row.notif_water_reminder === 1,
    notif_streak_warning: row.notif_streak_warning === 1,
    notif_weekly_summary: row.notif_weekly_summary === 1,
    breakfast_time: row.breakfast_time,
    lunch_time: row.lunch_time,
    dinner_time: row.dinner_time,
    water_interval_hours: row.water_interval_hours,
    water_start_time: row.water_start_time,
    water_end_time: row.water_end_time,
    weekly_summary_day: row.weekly_summary_day,
    dataRetentionMonths: Math.round(row.data_retention_days / 30),
    healthConnected: false, // implementation specific
    mealReminderTimes: {
      breakfast: row.breakfast_time,
      lunch: row.lunch_time,
      dinner: row.dinner_time,
      snack: '16:00', // default
    },
  };
}

export async function updateUser(profile: Partial<UserProfile>): Promise<void> {
  const db = await getDB();
  const sets: string[] = [];
  const params: any[] = [];

  if (profile.name !== undefined) { sets.push('name = ?'); params.push(profile.name); }
  if (profile.gender !== undefined) { sets.push('gender = ?'); params.push(profile.gender); }
  if (profile.age !== undefined) { sets.push('age = ?'); params.push(profile.age); }
  if (profile.height !== undefined) { sets.push('height_cm = ?'); params.push(profile.height); }
  if (profile.weight !== undefined) { sets.push('weight_kg = ?'); params.push(profile.weight); }
  if (profile.activityLevel !== undefined) { sets.push('activity_level = ?'); params.push(profile.activityLevel); }
  if (profile.bodyFatPercentage !== undefined) { sets.push('body_fat_percent = ?'); params.push(profile.bodyFatPercentage); }
  if (profile.onboardingCompleted !== undefined) { sets.push('onboarding_completed = ?'); params.push(profile.onboardingCompleted ? 1 : 0); }

  if (sets.length === 0) return;

  params.push(1); // id
  await db.runAsync(`UPDATE user SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...params);
}

export async function updateGoals(goals: UserGoals): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE user SET 
      goal = ?, 
      daily_calorie_goal = ?, 
      daily_protein_goal_g = ?, 
      daily_carbs_goal_g = ?, 
      daily_fat_goal_g = ?, 
      daily_budget_goal_tl = ?, 
      daily_step_goal = ?,
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = 1`,
    JSON.stringify(goals.goalType),
    goals.dailyCalorieTarget,
    goals.macroTarget.protein,
    goals.macroTarget.carbs,
    goals.macroTarget.fat,
    goals.dailyBudget,
    goals.stepGoal
  );
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
  const db = await getDB();
  const sets: string[] = [];
  const params: any[] = [];

  if (settings.breakfast_time !== undefined) { sets.push('breakfast_time = ?'); params.push(settings.breakfast_time); }
  if (settings.lunch_time !== undefined) { sets.push('lunch_time = ?'); params.push(settings.lunch_time); }
  if (settings.dinner_time !== undefined) { sets.push('dinner_time = ?'); params.push(settings.dinner_time); }
  
  if (settings.notif_meal_reminder !== undefined) { sets.push('notif_meal_reminder = ?'); params.push(settings.notif_meal_reminder ? 1 : 0); }
  if (settings.notif_calorie_alert !== undefined) { sets.push('notif_calorie_alert = ?'); params.push(settings.notif_calorie_alert ? 1 : 0); }
  if (settings.notif_water_reminder !== undefined) { sets.push('notif_water_reminder = ?'); params.push(settings.notif_water_reminder ? 1 : 0); }
  if (settings.notif_streak_warning !== undefined) { sets.push('notif_streak_warning = ?'); params.push(settings.notif_streak_warning ? 1 : 0); }
  if (settings.notif_weekly_summary !== undefined) { sets.push('notif_weekly_summary = ?'); params.push(settings.notif_weekly_summary ? 1 : 0); }
  
  if (settings.water_interval_hours !== undefined) { sets.push('water_interval_hours = ?'); params.push(settings.water_interval_hours); }
  if (settings.water_start_time !== undefined) { sets.push('water_start_time = ?'); params.push(settings.water_start_time); }
  if (settings.water_end_time !== undefined) { sets.push('water_end_time = ?'); params.push(settings.water_end_time); }
  if (settings.weekly_summary_day !== undefined) { sets.push('weekly_summary_day = ?'); params.push(settings.weekly_summary_day); }

  if (sets.length === 0) return;

  params.push(1); // id
  await db.runAsync(`UPDATE user SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...params);

}
