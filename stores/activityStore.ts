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
  deleteExercise: (id: string) => Promise<void>;
  updateSteps: (steps: number) => Promise<void>;
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
      const todayLog = useDailyStore.getState().todayLog;
      if (todayLog) {
         const exercisesData = await import('@/db/queries/activity').then(m => m.getExercises(todayLog.id));
         set({ 
            exercises: exercisesData,
            todaySteps: todayLog.stepCount || 0,
            todayBurnedCalories: todayLog.burnedCalories || 0
         });
      }
      
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
      
      // Reload daily log to get up-to-date total burned calories
      const updatedLog = await useDailyStore.getState().loadLog(todayLog.date.toISOString().split('T')[0]);
      
      // Update local state
      set(state => ({
        exercises: [newExercise, ...state.exercises],
        todayBurnedCalories: useDailyStore.getState().todayLog?.burnedCalories || (state.todayBurnedCalories + newExercise.burnedCalories)
      }));
    } catch (error) {
      console.error('[ActivityStore] Error adding exercise:', error);
    }
  },

  deleteExercise: async (id) => {
    const todayLog = useDailyStore.getState().todayLog;
    if (!todayLog) return;

    try {
      const { deleteExercise } = await import('@/db/queries/activity');
      await deleteExercise(id, todayLog.id);

      // Reload daily log
      await useDailyStore.getState().loadLog(todayLog.date.toISOString().split('T')[0]);

      set(state => ({
        exercises: state.exercises.filter(e => e.id !== id),
        todayBurnedCalories: useDailyStore.getState().todayLog?.burnedCalories || state.todayBurnedCalories
      }));
    } catch (error) {
      console.error('[ActivityStore] Error deleting exercise:', error);
    }
  },

  updateSteps: async (steps) => {
    const todayLog = useDailyStore.getState().todayLog;
    if (!todayLog) return;

    try {
      const { updateSteps: updateStepsQuery } = await import('@/db/queries/activity');
      await updateStepsQuery(todayLog.id, steps);
      
      // Reload daily log
      await useDailyStore.getState().loadLog(todayLog.date.toISOString().split('T')[0]);
      
      set({ 
        todaySteps: steps, 
        todayBurnedCalories: useDailyStore.getState().todayLog?.burnedCalories || 0 
      });
    } catch (error) {
      console.error('[ActivityStore] Error updating steps:', error);
    }
  },
}));
