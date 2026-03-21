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
    notificationsEnabled: true, // simplified
    mealReminderTimes: {
      breakfast: row.breakfast_time,
      lunch: row.lunch_time,
      dinner: row.dinner_time,
      snack: '16:00', // default
    },
    waterReminderIntervalMinutes: row.water_interval_hours * 60,
    waterReminderStartHour: parseInt(row.water_start_time.split(':')[0]),
    waterReminderEndHour: parseInt(row.water_end_time.split(':')[0]),
    dataRetentionMonths: Math.round(row.data_retention_days / 30),
    healthConnected: false, // implementation specific
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
