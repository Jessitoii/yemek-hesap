import { SQLiteDatabase } from 'expo-sqlite';

export const migration_006_daily_log = {
  name: '006_daily_log',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_log (
        id                        TEXT PRIMARY KEY,             -- uuid
        date                      TEXT NOT NULL UNIQUE,         -- 'YYYY-MM-DD'

        total_calories            REAL DEFAULT 0,
        total_protein_g           REAL DEFAULT 0,
        total_carbs_g             REAL DEFAULT 0,
        total_fat_g               REAL DEFAULT 0,
        total_spending_tl         REAL DEFAULT 0,

        step_count                INTEGER DEFAULT 0,
        burned_calories           REAL DEFAULT 0,

        created_at                TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_daily_log_date ON daily_log(date);
    `);
  },
};
