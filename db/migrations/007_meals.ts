import { SQLiteDatabase } from 'expo-sqlite';

export const migration_007_meals = {
  name: '007_meals',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meals (
        id                        TEXT PRIMARY KEY,             -- uuid
        log_id                    TEXT NOT NULL REFERENCES daily_log(id) ON DELETE CASCADE,

        meal_type                 TEXT NOT NULL,                -- 'breakfast' | 'lunch' | 'dinner' | 'snack'

        recipe_id                 TEXT REFERENCES recipes(id),
        ingredient_id             TEXT REFERENCES ingredients(id),
        custom_name               TEXT,

        amount                    REAL NOT NULL,
        unit                      TEXT NOT NULL,
        amount_in_grams           REAL,

        -- snapshot values at time of logging
        calories                  REAL,
        protein_g                 REAL,
        carbs_g                   REAL,
        fat_g                     REAL,
        cost_tl                   REAL,

        logged_at                 TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_meals_log_id ON meals(log_id);
    `);
  },
};
