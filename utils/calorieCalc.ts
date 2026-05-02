import { Gender, ActivityLevel, GoalType, UserProfile } from '../types/user';

export interface CalorieTargets {
  dailyCalorieTarget: number;
}

/**
 * Calculates BMR using Katch-McArdle when body fat is available,
 * otherwise falls back to the Mifflin-St Jeor equation.
 */
export function calcBMR(
  gender: Gender,
  weight: number,
  height: number,
  age: number,
  bodyFatPercent?: number | null
): number {
  if (typeof bodyFatPercent === 'number' && bodyFatPercent > 0) {
    const leanMassKg = weight * (1 - bodyFatPercent / 100);
    return 370 + 21.6 * leanMassKg;
  }

  const genderOffset = gender === Gender.MALE ? 5 : -161;
  return 10 * weight + 6.25 * height - 5 * age + genderOffset;
}

/**
 * Calculates TDEE based on BMR and activity level.
 */
export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

export function calculateTDEE(profile: UserProfile): number {
  const bmr = calcBMR(
    profile.gender,
    profile.weight,
    profile.height,
    profile.age,
    profile.bodyFatPercentage
  );
  return calcTDEE(bmr, profile.activityLevel ?? ActivityLevel.SEDENTARY);
}

export function calculateDailyCalorieGoal(profile: UserProfile, goals: GoalType[]): CalorieTargets {
  return calcGoalTargets(calculateTDEE(profile), goals);
}

/**
 * Calculates daily calorie target based on TDEE and user goals.
 */
export function calcGoalTargets(tdee: number, goals: GoalType[]): CalorieTargets {
  let target = tdee;

  if (goals.includes(GoalType.LOSE_WEIGHT)) {
    target -= 500; // Common deficit for safe weight loss
  } else if (goals.includes(GoalType.GAIN_WEIGHT)) {
    target += 300; // Common surplus for weight gain
  }

  return {
    dailyCalorieTarget: Math.round(target),
  };
}
