import { getDB } from '../index';

export interface UserStats {
  monthlySpending: number;
  monthlyAvgCalories: number;
  mostCookedRecipeName: string;
  totalBurnedCalories: number;
  longestStreak: number;
}

export async function getUserStats(): Promise<UserStats> {
  const db = await getDB();
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Monthly Spending
  const spendingRow = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(total_spending_tl) as total FROM daily_log WHERE date >= ?',
    firstDayOfMonth
  );

  // Monthly Avg Calories
  const caloriesRow = await db.getFirstAsync<{ avg: number }>(
    'SELECT AVG(total_calories) as avg FROM daily_log WHERE date >= ? AND total_calories > 0',
    firstDayOfMonth
  );

  // Most Cooked Recipe
  const recipeRow = await db.getFirstAsync<{ name: string }>(
    `SELECT custom_name as name, COUNT(*) as count 
     FROM meals 
     WHERE recipe_id IS NOT NULL 
     GROUP BY recipe_id 
     ORDER BY count DESC 
     LIMIT 1`
  );

  // Total Burned Calories
  const burnedRow = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(burned_calories) as total FROM daily_log'
  );

  // Longest Streak (Calculating max of consecutive completed days)
  // This is a bit complex in pure SQL Lite for a simple query
  // For now let's just get the MAX(streak_count) from streak table
  const streakRow = await db.getFirstAsync<{ max: number }>(
     'SELECT MAX(streak_count) as max FROM streak'
  );

  return {
    monthlySpending: Math.round(spendingRow?.total || 0),
    monthlyAvgCalories: Math.round(caloriesRow?.avg || 0),
    mostCookedRecipeName: recipeRow?.name || 'Tarif Yok',
    totalBurnedCalories: Math.round(burnedRow?.total || 0),
    longestStreak: streakRow?.max || 0,
  };
}
