import { Gender, ActivityLevel, GoalType } from '../types/user';

export interface CalorieTargets {
  dailyCalorieTarget: number;
}

/**
 * Calculates BMR using the Mifflin-St Jeor equation.
 */
export function calcBMR(
  gender: Gender,
  weight: number,
  height: number,
  age: number
): number {
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
