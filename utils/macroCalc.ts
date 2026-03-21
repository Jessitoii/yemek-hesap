import { GoalType } from '../types/user';

export interface MacroGoals {
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calculates macro goals (in grams) based on calorie target and goal type.
 */
export function calcMacrosFromGoal(
  calorieTarget: number,
  goals: GoalType[]
): MacroGoals {
  let proteinRatio = 0.3;
  let carbsRatio = 0.4;
  let fatRatio = 0.3;

  if (goals.includes(GoalType.LOSE_WEIGHT)) {
    proteinRatio = 0.35;
    carbsRatio = 0.35;
    fatRatio = 0.3;
  } else if (goals.includes(GoalType.GAIN_WEIGHT)) {
    proteinRatio = 0.25;
    carbsRatio = 0.5;
    fatRatio = 0.25;
  } else if (goals.includes(GoalType.STAY_FIT)) {
    proteinRatio = 0.3;
    carbsRatio = 0.45;
    fatRatio = 0.25;
  }

  return {
    protein: Math.round((calorieTarget * proteinRatio) / 4),
    carbs: Math.round((calorieTarget * carbsRatio) / 4),
    fat: Math.round((calorieTarget * fatRatio) / 9),
  };
}
