import { SQLiteDatabase } from 'expo-sqlite';

export const migration_003_recipes = {
  name: '003_recipes',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recipes (
        id                        TEXT PRIMARY KEY,             -- uuid

        name                      TEXT NOT NULL,
        image_url                 TEXT,
        serving_count             INTEGER DEFAULT 1,
        source                    TEXT NOT NULL,                -- 'user' | 'themealdb'
        themealdb_id              TEXT,
        cuisine                   TEXT,
        category                  TEXT,
        instructions              TEXT,

        -- calculated totals
        total_cost_tl             REAL,
        total_calories            REAL,
        total_protein_g           REAL,
        total_carbs_g             REAL,
        total_fat_g               REAL,
        cost_per_serving_tl       REAL,
        calories_per_serving      REAL,

        is_favorite               INTEGER DEFAULT 0,

        created_at                TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at                TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
};
