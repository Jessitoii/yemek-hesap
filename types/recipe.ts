import { IngredientQuantity } from './ingredient';

export interface RecipeIngredient extends IngredientQuantity {
  id: string;
  recipeId: string;
  name: string;
}

export interface Recipe {
  id: string;
  name: string;
  imageUrl?: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions?: string;
  cuisine?: string;
  source?: 'TheMealDB' | 'Custom';
  totalCalories: number | null;
  totalCost: number | null;
  macros: {
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
