export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
}

export enum GoalType {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  GAIN_WEIGHT = 'GAIN_WEIGHT',
  STAY_FIT = 'STAY_FIT',
  EAT_HEALTHIER = 'EAT_HEALTHIER',
  REDUCE_SPENDING = 'REDUCE_SPENDING',
}

export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  bodyFatPercentage?: number;
  onboardingCompleted: boolean;
}

export interface UserGoals {
  goalType: GoalType[];
  dailyCalorieTarget: number;
  macroTarget: {
    protein: number;
    carbs: number;
    fat: number;
  };
  dailyBudget: number;
  stepGoal: number;
  exerciseCalorieGoal: number;
  waterGoal?: number;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  notif_meal_reminder: boolean;
  notif_calorie_alert: boolean;
  notif_water_reminder: boolean;
  notif_streak_warning: boolean;
  notif_weekly_summary: boolean;
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
  water_interval_hours: number;
  water_start_time: string;
  water_end_time: string;
  weekly_summary_day: string;
  dataRetentionMonths: number;
  healthConnected: boolean;
  mealReminderTimes: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
}


export interface UserStats {
  monthlySpending: number;
  monthlyAvgCalories: number;
  mostCookedRecipeName: string;
  totalBurnedCalories: number;
  longestStreak: number;
}
