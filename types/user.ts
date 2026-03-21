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
  waterGoal?: number;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  mealReminderTimes: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  waterReminderIntervalMinutes: number;
  waterReminderStartHour: number;
  waterReminderEndHour: number;
  dataRetentionMonths: number;
  healthConnected: boolean;
}
