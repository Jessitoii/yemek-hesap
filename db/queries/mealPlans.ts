import { getDB } from '../index';
import { MealPlan, DayPlan } from '../../types/mealPlan';

export async function savePlan(plan: MealPlan): Promise<void> {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO meal_plans (
        id, title, start_date, end_date, calorie_goal, budget_goal_tl, generated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      plan.id, 'My Meal Plan', 
      new Date().toISOString(), 
      new Date(Date.now() + plan.durationDays * 24 * 3600 * 1000).toISOString(),
      plan.avgDailyCalories, plan.totalCost, 'cerebras'
    );

    for (const day of plan.days) {
      const meals = [day.breakfast, day.lunch, day.dinner, day.snack];
      const types = ['breakfast', 'lunch', 'dinner', 'snack'];
      
      for (let i = 0; i < meals.length; i++) {
        const meal = meals[i];
        await db.runAsync(
          `INSERT INTO meal_plan_items (
            id, plan_id, date, meal_type, recipe_id, recipe_name, calories, cost_tl
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          Math.random().toString(36),
          plan.id, day.day.toString(), types[i], meal.recipeId, meal.name, meal.calories, meal.cost
        );
      }
    }
  });
}

export async function getPlans(): Promise<MealPlan[]> {
  const db = await getDB();
  const plans = await db.getAllAsync<any>('SELECT * FROM meal_plans');
  return plans.map(p => ({
     id: p.id,
     userId: '1',
     durationDays: 7, // derived
     days: [], // to be populated
     totalCost: p.budget_goal_tl,
     avgDailyCalories: p.calorie_goal,
     createdAt: new Date(p.created_at)
  }));
}
