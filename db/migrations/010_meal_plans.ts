import { SQLiteDatabase } from 'expo-sqlite';

export const migration_010_meal_plans = {
  name: '010_meal_plans',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id                        TEXT PRIMARY KEY,             -- uuid
        title                     TEXT,
        start_date                TEXT,
        end_date                  TEXT,
        calorie_goal              INTEGER,
        budget_goal_tl            REAL,
        generated_by              TEXT,                         -- 'rule_engine' | 'cerebras'
        created_at                TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meal_plan_items (
        id                        TEXT PRIMARY KEY,             -- uuid
        plan_id                   TEXT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
        date                      TEXT NOT NULL,
        meal_type                 TEXT NOT NULL,
        recipe_id                 TEXT REFERENCES recipes(id),
        recipe_name               TEXT,
        calories                  REAL,
        cost_tl                   REAL
      );
    `);
  },
};
