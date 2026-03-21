import { SQLiteDatabase } from 'expo-sqlite';

export const migration_011_cache = {
  name: '011_cache',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      -- Translation cache (never expires)
      CREATE TABLE IF NOT EXISTS translations (
        english                   TEXT PRIMARY KEY,
        turkish                   TEXT NOT NULL,
        created_at                TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Calorie/macro cache (never expires)
      CREATE TABLE IF NOT EXISTS calorie_cache (
        search_term               TEXT PRIMARY KEY,
        calories_per_100g         REAL,
        protein_per_100g          REAL,
        carbs_per_100g            REAL,
        fat_per_100g              REAL,
        source                    TEXT,                         -- 'openfoodfacts' | 'usda' | 'manual'
        created_at                TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Migros search cache (expires after 24 hours)
      CREATE TABLE IF NOT EXISTS migros_cache (
        search_term               TEXT PRIMARY KEY,
        results_json              TEXT NOT NULL,                -- JSON array of Migros products
        created_at                TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
};
