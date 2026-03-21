import { create } from 'zustand';
import { Exercise } from '@/types/activity';
import { addExercise, updateSteps } from '@/db/queries/activity';
import { getCurrentStreak } from '@/db/queries/streak';
import { useDailyStore } from './dailyStore';
import { generateId } from '@/utils/uuid';

interface ActivityState {
  todaySteps: number;
  todayBurnedCalories: number;
  exercises: Exercise[];
  streak: number;
  isLoading: boolean;

  // Actions
  loadActivity: (date: string) => Promise<void>;
  addExercise: (exercise: Omit<Exercise, 'id' | 'dailyLogId' | 'time'>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>; // placeholder
  updateSteps: (steps: number, burnedCalories: number) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  todaySteps: 0,
  todayBurnedCalories: 0,
  exercises: [],
  streak: 0,
  isLoading: false,

  loadActivity: async (date) => {
    set({ isLoading: true });
    try {
      // In a real app, you would fetch activity logs for the date.
      // Currently, most activity state is held in dailyStore's todayLog.
      // But we consolidate streak here.
      const currentStreak = await getCurrentStreak();
      set({ streak: currentStreak });
    } finally {
      set({ isLoading: false });
    }
  },

  addExercise: async (exerciseData) => {
    const todayLog = useDailyStore.getState().todayLog;
    if (!todayLog) return;

    try {
      const newExercise: Exercise = {
        ...exerciseData,
        id: generateId(),
        dailyLogId: todayLog.id,
        time: new Date(),
      };

      await addExercise(newExercise);
      // Adding exercise also updates burned_calories in daily_log
      await useDailyStore.getState().loadLog(todayLog.date.toISOString().split('T')[0]);
      
      set(state => ({
        exercises: [...state.exercises, newExercise],
        todayBurnedCalories: state.todayBurnedCalories + newExercise.burnedCalories
      }));
    } catch (error) {
      console.error('[ActivityStore] Error adding exercise:', error);
    }
  },

  deleteExercise: async (id) => {
    // Placeholder - query for deleting exercise would go here.
    set(state => ({
      exercises: state.exercises.filter(e => e.id !== id)
    }));
  },

  updateSteps: async (steps, burnedCalories) => {
    const todayLog = useDailyStore.getState().todayLog;
    if (!todayLog) return;

    try {
      await updateSteps(todayLog.id, steps, burnedCalories);
      set({ todaySteps: steps, todayBurnedCalories: burnedCalories });
      // Update dailyLog in store
      await useDailyStore.getState().loadLog(todayLog.date.toISOString().split('T')[0]);
    } catch (error) {
      console.error('[ActivityStore] Error updating steps:', error);
    }
  },
}));
