import { getDB } from '../index';
import { Meal } from '../../types/daily';

export async function addMeal(meal: Meal): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO meals (
      id, log_id, meal_type, recipe_id, ingredient_id, custom_name,
      amount, unit, amount_in_grams, calories, protein_g, carbs_g, fat_g, cost_tl, logged_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    meal.id, meal.dailyLogId, meal.type, meal.recipeId ?? null, meal.ingredientId ?? null, meal.name,
    meal.amount, meal.unit, meal.grams, meal.calories,
    meal.macros.protein, meal.macros.carbs, meal.macros.fat, meal.cost, meal.time.toISOString()
  );
}

export async function deleteMeal(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM meals WHERE id = ?', id);
}
