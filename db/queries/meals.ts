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

export async function updateMeal(id: string, updates: Partial<Meal>): Promise<void> {
  const db = await getDB();
  const sets: string[] = [];
  const params: any[] = [];

  if (updates.name !== undefined) { sets.push('custom_name = ?'); params.push(updates.name); }
  if (updates.calories !== undefined) { sets.push('calories = ?'); params.push(updates.calories); }
  if (updates.cost !== undefined) { sets.push('cost_tl = ?'); params.push(updates.cost); }
  
  if (updates.macros) {
    if (updates.macros.protein !== undefined) { sets.push('protein_g = ?'); params.push(updates.macros.protein); }
    if (updates.macros.carbs !== undefined) { sets.push('carbs_g = ?'); params.push(updates.macros.carbs); }
    if (updates.macros.fat !== undefined) { sets.push('fat_g = ?'); params.push(updates.macros.fat); }
  }

  if (sets.length === 0) return;

  params.push(id);
  await db.runAsync(`UPDATE meals SET ${sets.join(', ')} WHERE id = ?`, ...params);
}

export async function deleteMeal(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM meals WHERE id = ?', id);
}
