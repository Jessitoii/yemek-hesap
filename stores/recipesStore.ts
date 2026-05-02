import { create } from 'zustand';
import { Recipe, RecipeIngredient } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import { 
  getRecipes, saveRecipe, deleteRecipeById, toggleFavorite,
} from '@/db/queries/recipes';
import { 
  getIngredients, saveIngredient, deleteIngredient 
} from '@/db/queries/ingredients';

interface RecipesState {
  recipes: Recipe[];
  favorites: string[];
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
  favorites: [],
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
      set({ recipes: data, favorites: data.filter(recipe => recipe.isFavorite).map(recipe => recipe.id) });
    } finally {
      set({ isLoading: false });
    }
  },

  addRecipe: async (recipe) => {
    await saveRecipe(recipe);
    set(state => ({
      recipes: [recipe, ...state.recipes],
      favorites: recipe.isFavorite && !state.favorites.includes(recipe.id)
        ? [...state.favorites, recipe.id]
        : state.favorites
    }));
  },

  updateRecipe: async (recipe) => {
    await saveRecipe(recipe);
    set(state => ({
      recipes: state.recipes.map(r => r.id === recipe.id ? recipe : r),
      favorites: recipe.isFavorite
        ? state.favorites.includes(recipe.id) ? state.favorites : [...state.favorites, recipe.id]
        : state.favorites.filter(favoriteId => favoriteId !== recipe.id)
    }));
  },

  deleteRecipe: async (id) => {
    await deleteRecipeById(id);
    set(state => ({
      recipes: state.recipes.filter(r => r.id !== id),
      favorites: state.favorites.filter(favoriteId => favoriteId !== id)
    }));
  },

  toggleFavorite: async (id) => {
    const recipe = get().recipes.find(r => r.id === id);
    if (!recipe) {
      set(state => ({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter(favoriteId => favoriteId !== id)
          : [...state.favorites, id]
      }));
      return;
    }

    const newFavorite = !recipe.isFavorite;
    await toggleFavorite(id, newFavorite);
    set(state => ({
      recipes: state.recipes.map(r => r.id === id ? { ...r, isFavorite: newFavorite } : r),
      favorites: newFavorite
        ? state.favorites.includes(id) ? state.favorites : [...state.favorites, id]
        : state.favorites.filter(favoriteId => favoriteId !== id)
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
