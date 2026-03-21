import { SQLiteDatabase } from 'expo-sqlite';

export const migration_005_price_history = {
  name: '005_price_history',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS price_history (
        id                        TEXT PRIMARY KEY,             -- uuid
        ingredient_id             TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        price_kurus               INTEGER NOT NULL,
        recorded_at               TEXT NOT NULL                 -- 'YYYY-MM-DD'
      );

      CREATE INDEX IF NOT EXISTS idx_price_history_ingredient
        ON price_history(ingredient_id, recorded_at);
    `);
  },
};
