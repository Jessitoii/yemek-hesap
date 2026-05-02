import { getDB } from '../index';
import { Exercise } from '../../types/activity';

export interface DailyBalance {
  date: string;
  consumedCalories: number;
  burnedCalories: number;
}

export async function addExercise(exercise: Exercise): Promise<void> {
  const db = await getDB();
  // Using transaction to prevent "database is locked" errors and ensure atomicity
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO activity_log (
        id, log_id, exercise_type, duration_minutes, burned_calories, notes, logged_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      exercise.id, exercise.dailyLogId, exercise.type, exercise.durationMinutes, 
      exercise.burnedCalories, exercise.notes ?? null, exercise.time.toISOString()
    );

    // Update daily log burned calories (exercise sum + step calories)
    await db.runAsync(
      `UPDATE daily_log SET burned_calories = (
        SELECT COALESCE(SUM(burned_calories), 0) FROM activity_log WHERE log_id = ?
      ) + (step_count * 0.04) WHERE id = ?`,
      exercise.dailyLogId, exercise.dailyLogId
    );
  });
}

export async function updateSteps(logId: string, steps: number): Promise<void> {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    // 1. Update step_count
    await db.runAsync(
      `UPDATE daily_log SET step_count = ? WHERE id = ?`,
      steps, logId
    );

    // 2. Recalculate burned_calories based on new step_count and current exercise sum
    await db.runAsync(
      `UPDATE daily_log SET burned_calories = (
        SELECT COALESCE(SUM(burned_calories), 0) FROM activity_log WHERE log_id = ?
      ) + (step_count * 0.04) WHERE id = ?`,
      logId, logId
    );
  });
}

export async function getLastSevenDaysBalance(): Promise<DailyBalance[]> {
  const db = await getDB();
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().split('T')[0];
  });

  const rows = await db.getAllAsync<{
    date: string;
    consumedCalories: number | null;
    burnedCalories: number | null;
  }>(
    `SELECT date, total_calories as consumedCalories, burned_calories as burnedCalories
     FROM daily_log
     WHERE date BETWEEN ? AND ?`,
    dates[0], dates[6]
  );
  const balanceByDate = new Map(rows.map(row => [row.date, row]));

  return dates.map(date => {
    const row = balanceByDate.get(date);
    return {
      date,
      consumedCalories: row?.consumedCalories ?? 0,
      burnedCalories: row?.burnedCalories ?? 0,
    };
  });
}

export async function getExercises(logId: string): Promise<Exercise[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>(
    'SELECT id, log_id as dailyLogId, exercise_type as type, duration_minutes as durationMinutes, burned_calories as burnedCalories, notes, logged_at as time FROM activity_log WHERE log_id = ? ORDER BY logged_at DESC',
    logId
  );
  return rows.map(r => ({
    ...r,
    time: new Date(r.time),
  }));
}

export async function deleteExercise(id: string, logId: string): Promise<void> {
    const db = await getDB();
    await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM activity_log WHERE id = ?', id);
        
        // Recalculate burned calories from remaining exercises + steps
        await db.runAsync(
            `UPDATE daily_log SET burned_calories = (
                SELECT COALESCE(SUM(burned_calories), 0) FROM activity_log WHERE log_id = ?
            ) + (step_count * 0.04) WHERE id = ?`,
            logId, logId
        );
    });
}
