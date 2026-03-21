export interface MigrosProduct {
  id: string;
  name: string;
  priceTL: number;
  priceKurus: number;
  regularPriceTL: number;
  discountRate: number;
  unitPrice: string | null;
  imageUrl: string | null;
  brand: string | null;
  category: string | null;
  topCategory: string | null;
}

export interface NutritionData {
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  source: 'openfoodfacts' | 'usda' | 'manual';
}

export interface ImageResult {
  id: string;
  url: string;
  thumbUrl: string;
  credit: string;
}

export interface RawIngredient {
  nameEn: string;
  measure: string;
}

export interface TheMealDBRecipe {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  instructions: string;
  imageUrl: string;
  ingredients: RawIngredient[];
}

export interface MealPlanParams {
  days: number;
  calorieGoal: number;
  budgetGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export interface MealPlanResult {
  days: {
    day: number;
    meals: {
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      recipeName: string;
      calories: number;
      ingredients: string[];
    }[];
  }[];
  totalStats: {
    avgCalories: number;
    avgCost: number;
  };
}

/**
 * Low-level API response types (used only in services)
 */
export interface TheMealDBResponse {
  meals: any[] | null;
}

export interface OpenFoodFactsResponse {
  products: any[];
}

export interface USDAResponse {
  foods: any[];
}

export interface UnsplashResponse {
  results: any[];
}
