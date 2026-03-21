import { SQLiteDatabase } from 'expo-sqlite';

export const migration_009_streak = {
  name: '009_streak',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS streak (
        id                        TEXT PRIMARY KEY,             -- uuid
        date                      TEXT NOT NULL UNIQUE,         -- 'YYYY-MM-DD'
        completed                 INTEGER DEFAULT 0,            -- 0 | 1
        streak_count              INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_streak_date ON streak(date);
    `);
  },
};
