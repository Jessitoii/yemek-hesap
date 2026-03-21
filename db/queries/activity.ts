import { getDB } from '../index';
import { Exercise } from '../../types/activity';

export async function addExercise(exercise: Exercise): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO activity_log (
      id, log_id, exercise_type, duration_minutes, burned_calories, notes, logged_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    exercise.id, exercise.dailyLogId, exercise.type, exercise.durationMinutes, 
    exercise.burnedCalories, exercise.notes ?? null, exercise.time.toISOString()
  );

  // Update daily log burned calories
  await db.runAsync(
    `UPDATE daily_log SET burned_calories = (SELECT SUM(burned_calories) FROM activity_log WHERE log_id = ?) WHERE id = ?`,
    exercise.dailyLogId, exercise.dailyLogId
  );
}

export async function updateSteps(logId: string, steps: number, calories: number): Promise<void> {
  const db = await getDB();
  // We assume steps are recorded separately in the daily_log
  await db.runAsync(
    `UPDATE daily_log SET step_count = ?, burned_calories = burned_calories + ? WHERE id = ?`,
    steps, calories, logId
  );
}
