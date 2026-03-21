export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  unit: string;
}

export interface MigrosProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
  pricePerUnit?: number;
  unitType?: string;
  brand?: string;
  category?: string;
  topCategory?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  imageUrl?: string;
  migrosProductId?: string;
  lastKnownPrice?: number;
  nutrition: NutritionData;
  priceSyncDate?: Date;
  custom?: boolean;
}

export interface IngredientQuantity {
  ingredientId: string;
  amount: number;
  unit: string;
  grams: number;
}
