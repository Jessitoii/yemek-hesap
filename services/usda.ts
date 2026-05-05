import { NutritionData } from '@/types/api';

const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY ?? 'DEMO_KEY';

type USDANutrient = {
  nutrientName?: string;
  unitName?: string;
  value?: number;
};

type USDAFood = {
  foodNutrients?: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
};

function nutrientValue(nutrients: USDANutrient[], predicate: (nutrient: USDANutrient) => boolean): number | null {
  const match = nutrients.find(predicate);
  return match?.value != null ? Number(match.value) : null;
}

/**
 * Fetches nutrition data from USDA FoodData Central as fallback.
 * Demo key works for 50 requests/day.
 */
export async function getNutritionFromUSDA(query: string): Promise<NutritionData | null> {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=5`;

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) console.warn('[USDA API] Rate limit reached (DEMO_KEY)');
      return null;
    }

    const json = await response.json();
    const foods: USDAFood[] = json?.foods ?? [];
    if (foods.length === 0) return null;

    const food = foods[0];
    const nutrients = food.foodNutrients ?? [];

    if (food.servingSize != null && Number(food.servingSize) !== 100) {
      console.warn('[USDA API] Food has servingSize other than 100g; nutrient values may need review:', food.servingSize, food.servingSizeUnit);
    }

    const exactEnergy = nutrientValue(
      nutrients,
      (n) => n.nutrientName === 'Energy' && n.unitName?.toUpperCase() === 'KCAL'
    );
    const fallbackEnergy = nutrientValue(
      nutrients,
      (n) => n.nutrientName?.toLowerCase().includes('energy') === true && n.unitName?.toUpperCase() === 'KCAL'
    );
    const calories = exactEnergy ?? fallbackEnergy;
    if (calories === null) return null;

    return {
      calories: Math.round(Number(calories)),
      protein: nutrientValue(nutrients, (n) => n.nutrientName?.toLowerCase() === 'protein'),
      carbs: nutrientValue(nutrients, (n) => n.nutrientName?.toLowerCase().includes('carbohydrate') === true),
      fat: nutrientValue(nutrients, (n) => n.nutrientName?.toLowerCase().includes('total lipid') === true),
      source: 'usda',
    };
  } catch (error) {
    console.warn('[USDA API] Error fetching nutrition:', error);
    return null;
  }
}
