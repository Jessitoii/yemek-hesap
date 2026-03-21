import { SQLiteDatabase } from 'expo-sqlite';

export const migration_002_ingredients = {
  name: '002_ingredients',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id                        TEXT PRIMARY KEY,             -- uuid

        name_tr                   TEXT NOT NULL,
        name_en                   TEXT,

        source                    TEXT NOT NULL,                -- 'user' | 'themealdb' | 'openfoodfacts'
        manually_added            INTEGER DEFAULT 0,            -- 1 = user's own ingredient

        image_url                 TEXT,

        -- nutrition per 100g
        calories_per_100g         REAL,
        protein_per_100g          REAL,
        carbs_per_100g            REAL,
        fat_per_100g              REAL,
        nutrition_source          TEXT,                         -- 'openfoodfacts' | 'usda' | 'manual'

        -- migros product
        migros_product_name       TEXT,
        migros_price_kurus        INTEGER,
        migros_product_image_url  TEXT,
        migros_price_updated_at   TEXT,

        created_at                TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at                TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
};
