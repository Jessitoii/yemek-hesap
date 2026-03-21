import { ExerciseType, exercises } from '../constants/exercises';

/**
 * Calculates burned calories for an exercise.
 * Formula: calories = MET * weight_kg * duration_hours
 * @param type Exercise type.
 * @param durationMinutes Exercise duration in minutes.
 * @param weightKg User's weight in kilograms.
 * @returns Estimated burned calories.
 */
export function calcExerciseCalories(
  type: ExerciseType | string,
  durationMinutes: number,
  weightKg: number
): number {
  const met = exercises.find(e => e.type === type)?.met ?? 4.0;
  return Math.round(met * weightKg * (durationMinutes / 60));
}
