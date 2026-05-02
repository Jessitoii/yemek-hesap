import { getDB } from '../index';
import { Recipe, RecipeIngredient } from '../../types/recipe';

export async function getRecipes(): Promise<Recipe[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>('SELECT * FROM recipes ORDER BY updated_at DESC');
  
  const recipes: Recipe[] = [];
  for (const row of rows) {
    const ingredients = await db.getAllAsync<any>(
      `SELECT ri.*, i.name_tr, i.image_url 
       FROM recipe_ingredients ri 
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id 
       WHERE ri.recipe_id = ?`,
      row.id
    );
    recipes.push({
      id: row.id,
      name: row.name,
      imageUrl: row.image_url,
      servings: row.serving_count,
      ingredients: ingredients.map(i => ({
         id: i.id,
         recipeId: i.recipe_id,
         ingredientId: i.ingredient_id,
         amount: i.amount,
         unit: i.unit,
         grams: i.amount_in_grams,
         name: i.name_tr || 'Bilinmeyen Malzeme'
      })),
      instructions: row.instructions,
      cuisine: row.cuisine,
      source: row.source,
      totalCalories: row.total_calories,
      totalCost: row.total_cost_tl,
      macros: {
        protein: row.total_protein_g,
        carbs: row.total_carbs_g,
        fat: row.total_fat_g
      },
      isFavorite: row.is_favorite === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }
  return recipes;
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>('SELECT * FROM recipes WHERE id = ?', id);
  if (!row) return null;

  const ingredients = await db.getAllAsync<any>(
    'SELECT ri.*, i.name_tr FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id = i.id WHERE ri.recipe_id = ?',
    id
  );

  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url,
    servings: row.serving_count,
    ingredients: ingredients.map(i => ({
       id: i.id,
       recipeId: i.recipe_id,
       ingredientId: i.ingredient_id,
       amount: i.amount,
       unit: i.unit,
       grams: i.amount_in_grams,
       name: i.name_tr
    })),
    instructions: row.instructions,
    cuisine: row.cuisine,
    source: row.source,
    totalCalories: row.total_calories,
    totalCost: row.total_cost_tl,
    macros: {
      protein: row.total_protein_g,
      carbs: row.total_carbs_g,
      fat: row.total_fat_g
    },
    isFavorite: row.is_favorite === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    // Insert/Update Recipe
    await db.runAsync(
      `INSERT OR REPLACE INTO recipes (
        id, name, image_url, serving_count, source, cuisine, category, instructions,
        total_cost_tl, total_calories, total_protein_g, total_carbs_g, total_fat_g,
        is_favorite, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      recipe.id, recipe.name, recipe.imageUrl ?? null, recipe.servings, recipe.source ?? null,
      recipe.cuisine ?? null, '', recipe.instructions ?? null, recipe.totalCost, recipe.totalCalories,
      recipe.macros.protein, recipe.macros.carbs, recipe.macros.fat, recipe.isFavorite ? 1 : 0
    );

    // Update Ingredients (Delete and Re-insert simplified)
    await db.runAsync('DELETE FROM recipe_ingredients WHERE recipe_id = ?', recipe.id);
    for (const ing of recipe.ingredients) {
      await db.runAsync(
        `INSERT INTO recipe_ingredients (
          id, recipe_id, ingredient_id, amount, unit, amount_in_grams
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        ing.id, recipe.id, ing.ingredientId, ing.amount, ing.unit, ing.grams
      );
    }
  });
}

export async function deleteRecipeById(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', id);
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE recipes SET is_favorite = ? WHERE id = ?', isFavorite ? 1 : 0, id);
}
