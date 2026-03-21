import { getDB } from '../index';
import { Streak, StreakDay } from '../../types/activity';

export async function getCurrentStreak(): Promise<number> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>(
    'SELECT streak_count FROM streak ORDER BY date DESC LIMIT 1'
  );
  return row ? row.streak_count : 0;
}

export async function markDayComplete(date: string, completed: boolean): Promise<void> {
  const db = await getDB();
  const currentStreak = await getCurrentStreak();
  
  await db.runAsync(
    'INSERT OR REPLACE INTO streak (id, date, completed, streak_count) VALUES (?, ?, ?, ?)',
    Math.random().toString(36), // simplified id
    date,
    completed ? 1 : 0,
    completed ? currentStreak + 1 : 0
  );
}
