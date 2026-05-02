import { create } from 'zustand';
import { Exercise } from '@/types/activity';
import { addExercise, DailyBalance } from '@/db/queries/activity';
import { getCurrentStreak } from '@/db/queries/streak';
import { useDailyStore } from './dailyStore';
import { generateId } from '@/utils/uuid';

const STEPS_KCAL_PER_STEP = 0.04;

function calculateTodayBurnedCalories(steps: number, exercises: Exercise[]): number {
  const stepsCalories = steps * STEPS_KCAL_PER_STEP;
  const exercisesCaloriesSum = exercises.reduce((total, exercise) => total + exercise.burnedCalories, 0);
  return stepsCalories + exercisesCaloriesSum;
}

interface ActivityState {
  todaySteps: number;
  todayBurnedCalories: number;
  weeklyBalance: DailyBalance[];
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
  weeklyBalance: [],
  exercises: [],
  streak: 0,
  isLoading: false,

  loadActivity: async (date) => {
    set({ isLoading: true });
    try {
      let todayLog = useDailyStore.getState().todayLog;
      console.log('[Activity] initial todayLog:', todayLog);

      // If daily log not yet loaded, load it first
      if (!todayLog) {
        await useDailyStore.getState().loadLog(date);
        todayLog = useDailyStore.getState().todayLog;
        console.log('[Activity] todayLog after loadLog:', todayLog);
      }

      if (todayLog) {
         const exercisesData = await import('@/db/queries/activity').then(m => m.getExercises(todayLog.id));
         console.log('[Activity] exercises:', exercisesData);
         set({ 
            exercises: exercisesData,
            todaySteps: todayLog.stepCount || 0,
            todayBurnedCalories: calculateTodayBurnedCalories(todayLog.stepCount || 0, exercisesData)
         });
         console.log('[Activity] todaySteps:', todayLog.stepCount, 'burned:', calculateTodayBurnedCalories(todayLog.stepCount || 0, exercisesData));
      }

      const weeklyBalance = await import('@/db/queries/activity').then(m => m.getLastSevenDaysBalance());
      set({ weeklyBalance });
      
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
      await useDailyStore.getState().loadLog(todayLog.date.toISOString().split('T')[0]);
      
      // Update local state
      set(state => {
        const exercises = [newExercise, ...state.exercises];
        return {
          exercises,
          todayBurnedCalories: calculateTodayBurnedCalories(state.todaySteps, exercises)
        };
      });
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

      set(state => {
        const exercises = state.exercises.filter(e => e.id !== id);
        return {
          exercises,
          todayBurnedCalories: calculateTodayBurnedCalories(state.todaySteps, exercises)
        };
      });
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
      
      set(state => ({ 
        todaySteps: steps, 
        todayBurnedCalories: calculateTodayBurnedCalories(steps, state.exercises)
      }));
    } catch (error) {
      console.error('[ActivityStore] Error updating steps:', error);
    }
  },
}));
