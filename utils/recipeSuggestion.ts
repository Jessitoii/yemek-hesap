import { Recipe } from '../types/recipe';

type CompleteRecipe = Recipe & {
  totalCalories: number;
  macros: Recipe['macros'] & { protein: number };
};

/**
 * Returns a smart recipe suggestion based on remaining calories and macro gaps.
 * @param remainingCalories Remaining calorie budget for the day.
 * @param recipes List of available recipes.
 * @param macroGaps Remaining macro targets for the day (protein, carbs, fat).
 * @returns A recipe that fits the criteria or null.
 */
export function getSuggestion(
  remainingCalories: number,
  recipes: Recipe[],
  macroGaps: { protein: number; carbs: number; fat: number }
): Recipe | null {
  if (remainingCalories <= 0) return null;

  // Filter recipes that fit the remaining calorie budget
  const eligibleRecipes = recipes.filter((recipe): recipe is CompleteRecipe =>
    recipe.totalCalories != null
    && recipe.macros.protein != null
    && recipe.totalCalories <= remainingCalories
  );

  if (eligibleRecipes.length === 0) return null;

  // Simple scoring system: prioritize higher protein if there's a gap
  return eligibleRecipes.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (macroGaps.protein > 0) {
      scoreA += a.macros.protein * 2;
      scoreB += b.macros.protein * 2;
    }

    // Closer to remaining calories is better but not above
    scoreA -= Math.abs(remainingCalories - a.totalCalories) / 10;
    scoreB -= Math.abs(remainingCalories - b.totalCalories) / 10;

    return scoreB - scoreA;
  })[0];
}
