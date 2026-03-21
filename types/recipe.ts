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
  totalCalories: number;
  totalCost: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
