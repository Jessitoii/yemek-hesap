import { SQLiteDatabase } from 'expo-sqlite';

export async function up(db: SQLiteDatabase) {
  await db.execAsync(`
    ALTER TABLE daily_log ADD COLUMN water_ml INTEGER DEFAULT 0;
  `);
}
