import { useState, useEffect, useCallback, useRef } from 'react';
import { translateToTurkish } from '@/services/mymemory';
import { searchMigrosProducts } from '@/services/migros';
import { getNutritionFromOFF } from '@/services/openfoodfacts';
import { getNutritionFromUSDA } from '@/services/usda';
import { toGrams, parseMeasure, parseProductGrams } from '@/utils/unitConverter';
import { triggerRecipeCalculatedNotification } from '@/hooks/useNotifications';
import { MigrosProduct } from '@/types/ingredient';

export type IngredientCalcStatus = 'pending' | 'calculating' | 'done' | 'error';

export type IngredientCalcState = {
  nameEn: string;
  nameTr: string | null;
  measure: string;
  amount: number | null;
  unit: string | null;
  grams: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  costTL: number | null;
  migrosProduct: MigrosProduct | null;
  status: IngredientCalcStatus;
  requiresManualInput: boolean;
};

export type RecipeCalcResult = {
  ingredients: IngredientCalcState[];
  totalCalories: number | null;
  totalCost: number | null;
  totalProtein: number | null;
  totalCarbs: number | null;
  totalFat: number | null;
  isComplete: boolean;
  completedCount: number;
  totalCount: number;
};

const UNPARSEABLE_MEASURES = [
  'to taste', 'some', 'a pinch', 'as needed', 'as required',
  'a bit', 'a few', 'dash', 'splash', 'handful',
  'enough', 'desired', 'optional', 'garnish', 'for garnish',
  'to serve', 'for serving', 'to coat', 'for coating'
];

export function useRecipeCalculation(
  recipeName: string,
  rawIngredients: { nameEn: string; measure: string }[]
): RecipeCalcResult {
  const [ingredients, setIngredients] = useState<IngredientCalcState[]>(() => 
    rawIngredients.map(i => ({
      nameEn: i.nameEn,
      nameTr: null,
      measure: i.measure,
      amount: null,
      unit: null,
      grams: null,
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      costTL: null,
      migrosProduct: null,
      status: 'pending',
      requiresManualInput: UNPARSEABLE_MEASURES.some(u => 
        i.measure.toLowerCase().includes(u)
      ),
    }))
  );

  const notificationFired = useRef(false);

  const updateIngredient = useCallback((index: number, update: Partial<IngredientCalcState>) => {
    setIngredients(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...update };
      return next;
    });
  }, []);

  useEffect(() => {
    if (rawIngredients.length === 0) return;

    // Process each ingredient independently
    rawIngredients.forEach(async (raw, index) => {
      if (UNPARSEABLE_MEASURES.some(u => raw.measure.toLowerCase().includes(u))) {
        updateIngredient(index, { status: 'done', requiresManualInput: true });
        return;
      }

      updateIngredient(index, { status: 'calculating' });

      try {
        // 1. Translate
        const nameTr = await translateToTurkish(raw.nameEn);

        // 2. Parse measure -> grams
        const { amount, unit, requiresManualInput } = parseMeasure(raw.measure);
        const grams = toGrams(amount, unit, raw.nameEn);

        // 3. Migros search
        let migrosProduct: MigrosProduct | null = null;
        let costTL: number | null = null;
        try {
          const results = await searchMigrosProducts(nameTr || raw.nameEn);
          if (results.length > 0) {
            migrosProduct = results[0];
            if (grams && migrosProduct) {
              const productGrams = parseProductGrams(migrosProduct.name);
              costTL = (migrosProduct.price / productGrams) * grams;
            }
          }
        } catch (e) {
          console.warn('[Calculation] Migros fetch failed for', nameTr, e);
        }

        // 4. Nutrition
        let nutrition = await getNutritionFromOFF(raw.nameEn);
        if (!nutrition) nutrition = await getNutritionFromUSDA(raw.nameEn);

        const calories = nutrition && grams ? (nutrition.calories / 100) * grams : null;
        const protein = nutrition && grams && nutrition.protein ? (nutrition.protein / 100) * grams : null;
        const carbs = nutrition && grams && nutrition.carbs ? (nutrition.carbs / 100) * grams : null;
        const fat = nutrition && grams && nutrition.fat ? (nutrition.fat / 100) * grams : null;

        updateIngredient(index, {
          nameTr,
          amount,
          unit,
          grams,
          calories,
          protein,
          carbs,
          fat,
          costTL,
          migrosProduct,
          status: 'done',
          requiresManualInput: requiresManualInput || !grams
        });
      } catch (error) {
        console.error('[Calculation] Error processing', raw.nameEn, error);
        updateIngredient(index, { status: 'error' });
      }
    });

    // Reset notification trigger if ingredients change
    notificationFired.current = false;
  }, [rawIngredients, updateIngredient]);

  // Derived totals
  const doneIngredients = ingredients.filter(i => i.status === 'done');
  const completedCount = doneIngredients.length;
  const totalCount = ingredients.length;
  const isComplete = totalCount > 0 && completedCount === totalCount;

  const sum = (key: keyof IngredientCalcState) => {
    const valid = doneIngredients.filter(i => i[key] !== null);
    return valid.length > 0 ? valid.reduce((acc, i) => acc + (i[key] as number), 0) : null;
  };

  const totalCalories = sum('calories');
  const totalCost = sum('costTL');
  const totalProtein = sum('protein');
  const totalCarbs = sum('carbs');
  const totalFat = sum('fat');

  // Trigger notification on completion
  useEffect(() => {
    if (isComplete && !notificationFired.current) {
      notificationFired.current = true;
      triggerRecipeCalculatedNotification({
        recipeName,
        totalCalories,
        totalCost
      });
    }
  }, [isComplete, recipeName, totalCalories, totalCost]);

  return {
    ingredients,
    totalCalories,
    totalCost,
    totalProtein,
    totalCarbs,
    totalFat,
    isComplete,
    completedCount,
    totalCount
  };
}
