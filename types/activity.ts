import { ExerciseType as ExerciseTypeEnum } from '../constants/exercises';

export type ExerciseType = ExerciseTypeEnum;

export interface Exercise {
  id: string;
  dailyLogId: string;
  type: ExerciseType;
  name: string;
  durationMinutes: number;
  burnedCalories: number;
  time: Date;
  notes?: string;
}

export interface StreakDay {
  date: Date;
  completed: boolean;
  calorieGoalReached: boolean;
  stepGoalReached: boolean;
  budgetGoalReached: boolean;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
  history: StreakDay[];
}
