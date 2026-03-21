import { NutritionData } from '@/types/api';

const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY ?? 'DEMO_KEY';

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
    const foods = json?.foods ?? [];
    if (foods.length === 0) return null;

    // Use the first food item found
    const food = foods[0];
    const nutrients = food.foodNutrients ?? [];

    const find = (name: string) => {
      const match = nutrients.find((n: any) => 
        n.nutrientName?.toLowerCase().includes(name.toLowerCase())
      );
      return match ? match.value : null;
    };

    const calories = find('energy');
    if (calories === null) return null;

    return {
      calories: Math.round(Number(calories)),
      protein: find('protein'),
      carbs: find('carbohydrate'),
      fat: find('total lipid'),
      source: 'usda',
    };
  } catch (error) {
    console.warn('[USDA API] Error fetching nutrition:', error);
    return null;
  }
}
