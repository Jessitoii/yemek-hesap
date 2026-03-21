import { SQLiteDatabase } from 'expo-sqlite';

export const migration_008_activity_log = {
  name: '008_activity_log',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id                        TEXT PRIMARY KEY,             -- uuid
        log_id                    TEXT NOT NULL REFERENCES daily_log(id) ON DELETE CASCADE,

        exercise_type             TEXT NOT NULL,                -- 'running' | 'cycling' | 'fitness' | 'walking' | 'swimming' | 'football' | 'yoga' | 'other'
        duration_minutes          INTEGER NOT NULL,
        burned_calories           REAL NOT NULL,
        notes                     TEXT,

        logged_at                 TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
};
