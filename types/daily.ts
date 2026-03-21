export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

export interface Meal {
  id: string;
  dailyLogId: string;
  recipeId?: string;
  ingredientId?: string;
  name: string;
  imageUrl?: string;
  type: MealType;
  amount: number;
  unit: string;
  grams: number;
  calories: number;
  cost: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  time: Date;
}

export interface DailyLog {
  id: string;
  date: Date;
  meals: Meal[];
  totalCalories: number;
  totalCost: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  stepCount: number;
  burnedCalories: number;
  waterIntake: number;
  completed: boolean;
}

