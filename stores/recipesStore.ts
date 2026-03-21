import { create } from 'zustand';
import { Recipe, RecipeIngredient } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import { 
  getRecipes, saveRecipe, deleteRecipe, toggleFavorite,
} from '@/db/queries/recipes';
import { 
  getIngredients, saveIngredient, deleteIngredient 
} from '@/db/queries/ingredients';

interface RecipesState {
  recipes: Recipe[];
  ingredients: Ingredient[];
  isLoading: boolean;

  // Actions
  loadRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  loadIngredients: () => Promise<void>;
  addIngredient: (ingredient: Ingredient) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;

  // Drafting State (for new recipe creation)
  draftingIngredients: RecipeIngredient[];
  setDraftingIngredients: (ingredients: RecipeIngredient[]) => void;
  appendDraftingIngredient: (ingredient: RecipeIngredient) => void;
  clearDraftingIngredients: () => void;
}

export const useRecipesStore = create<RecipesState>((set, get) => ({
  recipes: [],
  ingredients: [],
  isLoading: false,
  draftingIngredients: [],

  setDraftingIngredients: (ingredients) => set({ draftingIngredients: ingredients }),
  appendDraftingIngredient: (ingredient) => set(state => ({ 
    draftingIngredients: [...state.draftingIngredients, ingredient] 
  })),
  clearDraftingIngredients: () => set({ draftingIngredients: [] }),

  loadRecipes: async () => {
    set({ isLoading: true });
    try {
      const data = await getRecipes();
      set({ recipes: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addRecipe: async (recipe) => {
    await saveRecipe(recipe);
    set(state => ({ recipes: [recipe, ...state.recipes] }));
  },

  updateRecipe: async (recipe) => {
    await saveRecipe(recipe);
    set(state => ({
      recipes: state.recipes.map(r => r.id === recipe.id ? recipe : r)
    }));
  },

  deleteRecipe: async (id) => {
    await deleteRecipe(id);
    set(state => ({
      recipes: state.recipes.filter(r => r.id !== id)
    }));
  },

  toggleFavorite: async (id) => {
    const recipe = get().recipes.find(r => r.id === id);
    if (!recipe) return;

    const newFavorite = !recipe.isFavorite;
    await toggleFavorite(id, newFavorite);
    set(state => ({
      recipes: state.recipes.map(r => r.id === id ? { ...r, isFavorite: newFavorite } : r)
    }));
  },

  loadIngredients: async () => {
    const data = await getIngredients();
    set({ ingredients: data });
  },

  addIngredient: async (ingredient) => {
    await saveIngredient(ingredient);
    set(state => ({ ingredients: [ingredient, ...state.ingredients] }));
  },

  deleteIngredient: async (id) => {
    await deleteIngredient(id);
    set(state => ({
      ingredients: state.ingredients.filter(i => i.id !== id)
    }));
  },
}));
