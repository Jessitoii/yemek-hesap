import { getDB } from '../index';
import { DailyLog, Meal, MealType } from '../../types/daily';

export async function getLogByDate(date: string): Promise<DailyLog | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>('SELECT * FROM daily_log WHERE date = ?', date);
  if (!row) return null;

  const meals = await db.getAllAsync<any>(
    'SELECT * FROM meals WHERE log_id = ? ORDER BY logged_at ASC',
    row.id
  );

  return {
    id: row.id,
    date: new Date(row.date),
    meals: meals.map(m => ({
      id: m.id,
      dailyLogId: m.log_id,
      recipeId: m.recipe_id,
      ingredientId: m.ingredient_id,
      name: m.custom_name,
      imageUrl: '', // joined as needed
      type: m.meal_type as MealType,
      amount: m.amount,
      unit: m.unit,
      grams: m.amount_in_grams,
      calories: m.calories,
      cost: m.cost_tl,
      macros: {
        protein: m.protein_g,
        carbs: m.carbs_g,
        fat: m.fat_g
      },
      time: new Date(m.logged_at)
    })),
    totalCalories: row.total_calories,
    totalCost: row.total_spending_tl,
    totalMacros: {
      protein: row.total_protein_g,
      carbs: row.total_carbs_g,
      fat: row.total_fat_g
    },
    stepCount: row.step_count,
    burnedCalories: row.burned_calories,
    waterIntake: row.water_ml || 0,
    completed: true // derived
  };
}

export async function createLog(id: string, date: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('INSERT INTO daily_log (id, date) VALUES (?, ?)', id, date);
}

export async function updateLogTotals(logId: string): Promise<void> {
  const db = await getDB();
  const res = await db.getFirstAsync<any>(
    'SELECT SUM(calories) as calories, SUM(protein_g) as protein, SUM(carbs_g) as carbs, SUM(fat_g) as fat, SUM(cost_tl) as cost FROM meals WHERE log_id = ?',
    logId
  );
  
  await db.runAsync(
    'UPDATE daily_log SET total_calories = ?, total_protein_g = ?, total_carbs_g = ?, total_fat_g = ?, total_spending_tl = ? WHERE id = ?',
    res.calories || 0, res.protein || 0, res.carbs || 0, res.fat || 0, res.cost || 0, logId
  );
}
export async function getLogsInRange(startDate: string, endDate: string): Promise<DailyLog[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM daily_log WHERE date BETWEEN ? AND ? ORDER BY date ASC',
    startDate,
    endDate
  );

  return rows.map(row => ({
    id: row.id,
    date: new Date(row.date),
    meals: [], // Simplified for range
    totalCalories: row.total_calories || 0,
    totalCost: row.total_spending_tl || 0,
    totalMacros: {
      protein: row.total_protein_g || 0,
      carbs: row.total_carbs_g || 0,
      fat: row.total_fat_g || 0
    },
    stepCount: row.step_count || 0,
    burnedCalories: row.burned_calories || 0,
    waterIntake: row.water_ml || 0,
    completed: row.completed === 1
  }));
}

export async function updateWater(logId: string, ml: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE daily_log SET water_ml = ? WHERE id = ?', ml, logId);
}
