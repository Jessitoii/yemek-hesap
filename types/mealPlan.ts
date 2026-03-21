import { MealType } from './daily';

export interface MealPlanItem {
  recipeId: string;
  name: string;
  type: MealType;
  calories: number;
  cost: number;
}

export interface DayPlan {
  day: number;
  breakfast: MealPlanItem;
  lunch: MealPlanItem;
  dinner: MealPlanItem;
  snack: MealPlanItem;
  totalCalories: number;
  totalCost: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  durationDays: number;
  days: DayPlan[];
  totalCost: number;
  avgDailyCalories: number;
  createdAt: Date;
}
