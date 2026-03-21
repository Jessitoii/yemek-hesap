import { create } from 'zustand';
import { DailyLog, Meal } from '@/types/daily';
import { Recipe } from '@/types/recipe';
import { getLogByDate, createLog, updateLogTotals, updateWater } from '@/db/queries/dailyLog';
import { addMeal, deleteMeal } from '@/db/queries/meals';
import { generateId } from '@/utils/uuid';
import { getSuggestion } from '@/utils/recipeSuggestion';
import { useRecipesStore } from './recipesStore';
import { useUserStore } from './userStore';

interface DailyState {
  selectedDate: string; // YYYY-MM-DD
  todayLog: DailyLog | null;
  suggestion: Recipe | null;
  isLoading: boolean;

  // Actions
  setSelectedDate: (date: string) => void;
  loadLog: (date: string) => Promise<void>;
  addMeal: (meal: Omit<Meal, 'id' | 'dailyLogId' | 'time'>, date?: string) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  addWater: (ml: number) => Promise<void>;
  updateSuggestion: () => void;
}

export const useDailyStore = create<DailyState>((set, get) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  todayLog: null,
  suggestion: null,
  isLoading: false,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadLog(date);
  },

  loadLog: async (date) => {
    set({ isLoading: true });
    try {
      let log = await getLogByDate(date);
      if (!log) {
        const newLogId = generateId();
        await createLog(newLogId, date);
        log = await getLogByDate(date);
      }
      set({ todayLog: log });
      get().updateSuggestion();
    } finally {
      set({ isLoading: false });
    }
  },

  addMeal: async (mealData, date) => {
    const dateToUse = date || get().selectedDate;
    let log = await getLogByDate(dateToUse);

    if (!log) {
      const newLogId = generateId();
      await createLog(newLogId, dateToUse);
      log = await getLogByDate(dateToUse);
    }

    if (!log) return;

    try {
      const newMeal: Meal = {
        ...(mealData as any),
        id: generateId(),
        dailyLogId: log.id,
        time: new Date(),
      };

      await addMeal(newMeal);
      await updateLogTotals(log.id);
      
      // Refresh current log if target date matches selected date
      if (dateToUse === get().selectedDate) {
        await get().loadLog(get().selectedDate);
        
        // Trigger calorie alert
        const currentLog = get().todayLog;
        const userGoals = useUserStore.getState().goals;
        if (currentLog && userGoals) {
          const { triggerCalorieAlert } = await import('@/hooks/useNotifications');
          triggerCalorieAlert(currentLog.totalCalories, userGoals.dailyCalorieTarget);
        }
      }

    } catch (error) {
      console.error('[DailyStore] Error adding meal:', error);
    }
  },

  deleteMeal: async (id) => {
    const log = get().todayLog;
    if (!log) return;

    try {
      await deleteMeal(id);
      await updateLogTotals(log.id);
      await get().loadLog(get().selectedDate);

      // Trigger calorie alert
      const currentLog = get().todayLog;
      const userGoals = useUserStore.getState().goals;
      if (currentLog && userGoals) {
        const { triggerCalorieAlert } = await import('@/hooks/useNotifications');
        triggerCalorieAlert(currentLog.totalCalories, userGoals.dailyCalorieTarget);
      }

    } catch (error) {
      console.error('[DailyStore] Error deleting meal:', error);
    }
  },

  addWater: async (ml) => {
    const log = get().todayLog;
    if (!log) return;

    try {
      const newTotal = log.waterIntake + ml;
      await updateWater(log.id, newTotal);
      
      // Update local state directly for speed, or reload
      set((state) => ({
        todayLog: state.todayLog ? { ...state.todayLog, waterIntake: newTotal } : null
      }));
    } catch (error) {
      console.error('[DailyStore] Error adding water:', error);
    }
  },

  updateSuggestion: () => {
    const log = get().todayLog;
    const recipes = useRecipesStore.getState().recipes;
    const userGoals = useUserStore.getState().goals;

    if (!log || !userGoals || recipes.length < 1) {
      set({ suggestion: null });
      return;
    }

    const remainingCalories = userGoals.dailyCalorieTarget - log.totalCalories;
    const macroGaps = {
      protein: userGoals.macroTarget.protein - log.totalMacros.protein,
      carbs: userGoals.macroTarget.carbs - log.totalMacros.carbs,
      fat: userGoals.macroTarget.fat - log.totalMacros.fat,
    };

    const suggestion = getSuggestion(remainingCalories, recipes, macroGaps);
    set({ suggestion });
  },
}));
