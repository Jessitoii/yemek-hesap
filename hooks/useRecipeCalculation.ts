import { useState, useEffect, useCallback, useRef } from 'react';
import { translateToTurkish } from '@/services/mymemory';
import {
  isBouillonTabletProduct,
  isLiquidMeasureUnit,
  scoreMigrosMatch,
  searchMigrosProducts,
  shouldExcludeLiquidIngredientProduct
} from '@/services/migros';
import { getNutritionFromOFF } from '@/services/openfoodfacts';
import { getNutritionFromUSDA } from '@/services/usda';
import { toGrams, parseMeasure, parseProductGrams } from '@/utils/unitConverter';
import { calcCostFromUnitPrice, calcCostTL, parseUnitPricePerKg } from '@/utils/priceCalc';
import { triggerRecipeCalculatedNotification } from '@/hooks/useNotifications';
import { MigrosProduct } from '@/types/ingredient';
import { getManualGramOverride } from '@/db/queries/cache';

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

function createInitialIngredientState(rawIngredients: { nameEn: string; measure: string }[]): IngredientCalcState[] {
  return rawIngredients.map(i => ({
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
  }));
}

const UNPARSEABLE_MEASURES = [
  'to taste', 'some', 'a pinch', 'as needed', 'as required',
  'a bit', 'a few', 'dash', 'splash', 'handful',
  'enough', 'desired', 'optional', 'garnish', 'for garnish',
  'to serve', 'for serving', 'to coat', 'for coating'
];

function sumComplete(ingredients: IngredientCalcState[], isComplete: boolean, key: keyof IngredientCalcState): number | null {
  if (!isComplete || ingredients.some(i => i[key] === null)) return null;
  return ingredients.reduce((acc, i) => acc + (i[key] as number), 0);
}

export function useRecipeCalculation(
  recipeName: string,
  rawIngredients: { nameEn: string; measure: string }[],
  calculationKey = recipeName
): RecipeCalcResult {
  const [ingredients, setIngredients] = useState<IngredientCalcState[]>(() =>
    createInitialIngredientState(rawIngredients)
  );

  const notificationFired = useRef(false);
  const hasCalculated = useRef<string | null>(null);

  const updateIngredient = useCallback((index: number, update: Partial<IngredientCalcState>) => {
    setIngredients(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...update };
      return next;
    });
  }, []);

  useEffect(() => {
    if (!calculationKey || rawIngredients.length === 0) {
      hasCalculated.current = null;
      notificationFired.current = false;
      setIngredients([]);
      return;
    }

    if (hasCalculated.current === calculationKey) return;
    hasCalculated.current = calculationKey;
    notificationFired.current = false;
    setIngredients(createInitialIngredientState(rawIngredients));

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
        let grams = toGrams(amount, unit, raw.nameEn);
        if (grams == null && unit === 'adet') {
          const manualUnitGrams = await getManualGramOverride(raw.nameEn, unit);
          grams = manualUnitGrams == null ? null : amount * manualUnitGrams;
        }

        // 3. Migros search
        let migrosProduct: MigrosProduct | null = null;
        let costTL: number | null = null;
        try {
          const migrosQuery = nameTr || raw.nameEn;
          console.log('[Calculation] Migros query for', raw.nameEn, '->', migrosQuery);
          const results = (await searchMigrosProducts(migrosQuery))
            .filter(product => !shouldExcludeLiquidIngredientProduct(product, raw.nameEn, unit));
          if (results.length > 0) {
            const scored = results
              .map(product => ({
                product,
                score: scoreMigrosMatch(product, migrosQuery, unit, amount, grams),
              }))
              .sort((a, b) => b.score - a.score);
            const bestMatch = scored.length > 0 && scored[0].score > 0 ? scored[0].product : null;
            const blockedLiquidTablet = bestMatch
              ? isLiquidMeasureUnit(unit) && isBouillonTabletProduct(bestMatch.name)
              : false;

            migrosProduct = blockedLiquidTablet ? null : bestMatch;
            if (grams != null && migrosProduct) {
              const productGrams = parseProductGrams(migrosProduct.name);
              costTL = calcCostTL(migrosProduct.price, productGrams, grams);
              if (costTL == null) {
                costTL = calcCostFromUnitPrice(parseUnitPricePerKg(migrosProduct.unitPrice), grams);
              }
            }
          }
        } catch (e) {
          console.warn('[Calculation] Migros fetch failed for', nameTr, e);
        }

        // 4. Nutrition
        let nutrition = await getNutritionFromOFF(raw.nameEn);
        if (!nutrition) nutrition = await getNutritionFromUSDA(raw.nameEn);

        const calories = nutrition && grams != null ? (nutrition.calories / 100) * grams : null;
        const protein = nutrition && grams != null && nutrition.protein != null ? (nutrition.protein / 100) * grams : null;
        const carbs = nutrition && grams != null && nutrition.carbs != null ? (nutrition.carbs / 100) * grams : null;
        const fat = nutrition && grams != null && nutrition.fat != null ? (nutrition.fat / 100) * grams : null;

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
          requiresManualInput: requiresManualInput || grams == null
        });
      } catch (error) {
        console.error('[Calculation] Error processing', raw.nameEn, error);
        updateIngredient(index, { status: 'error' });
      }
    });

    // Reset notification trigger if ingredients change
    notificationFired.current = false;
  }, [calculationKey]);

  useEffect(() => {
    const allDone = ingredients.length > 0 && ingredients.every(i => i.status === 'done');
    if (!allDone) return;

    setIngredients(prev => {
      const usedMigrosIds = new Map<string, string>();
      let changed = false;
      const next = prev.map(ingredient => {
        const migrosProductId = ingredient.migrosProduct?.id;
        if (!migrosProductId) return ingredient;

        const ingredientName = ingredient.nameEn.trim().toLowerCase();
        const existingIngredientName = usedMigrosIds.get(migrosProductId);
        if (existingIngredientName && existingIngredientName !== ingredientName) {
          if (ingredient.costTL != null) {
            console.warn(
              '[Calculation] Duplicate Migros product match:',
              migrosProductId,
              existingIngredientName,
              ingredientName
            );
            changed = true;
            return { ...ingredient, costTL: null };
          }
          return ingredient;
        }

        usedMigrosIds.set(migrosProductId, ingredientName);
        return ingredient;
      });

      return changed ? next : prev;
    });
  }, [ingredients]);

  // Derived totals
  const doneIngredients = ingredients.filter(i => i.status === 'done');
  const completedCount = doneIngredients.length;
  const totalCount = ingredients.length;
  const isComplete = totalCount > 0 && completedCount === totalCount;

  const totalCalories = sumComplete(doneIngredients, isComplete, 'calories');
  const totalCost = sumComplete(doneIngredients, isComplete, 'costTL');
  const totalProtein = sumComplete(doneIngredients, isComplete, 'protein');
  const totalCarbs = sumComplete(doneIngredients, isComplete, 'carbs');
  const totalFat = sumComplete(doneIngredients, isComplete, 'fat');

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
