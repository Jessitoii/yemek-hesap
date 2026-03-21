import { SQLiteDatabase } from 'expo-sqlite';

export const migration_004_recipe_ingredients = {
  name: '004_recipe_ingredients',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id                        TEXT PRIMARY KEY,             -- uuid
        recipe_id                 TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        ingredient_id             TEXT NOT NULL REFERENCES ingredients(id),

        amount                    REAL NOT NULL,
        unit                      TEXT NOT NULL,                -- 'gram' | 'ml' | 'tablespoon' | 'teaspoon' | 'cup' | 'piece' | 'slice' | 'handful'
        amount_in_grams           REAL,

        -- price snapshot at time of saving
        price_snapshot_kurus      INTEGER,
        price_snapshot_date       TEXT,

        sort_order                INTEGER DEFAULT 0
      );
    `);
  },
};
