import { NutritionData } from '@/types/api';

type OFFNutriments = Record<string, unknown>;

type OFFProduct = {
  nutriments?: OFFNutriments;
  serving_quantity?: unknown;
};

type OFFSearchResponse = {
  products?: OFFProduct[];
};

function readNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeKcalPer100g(product: OFFProduct): number | null {
  const n = product.nutriments;
  if (!n) return null;

  let kcal: number | null = null;
  const kcal100g = readNumber(n['energy-kcal_100g']);
  const kj100g = readNumber(n['energy-kj_100g']);
  const energy100g = readNumber(n.energy_100g);
  const servingKcal = readNumber(n['energy-kcal']);
  const servingQuantity = readNumber(product.serving_quantity);

  if (kcal100g != null) {
    kcal = kcal100g;
  } else if (kj100g != null) {
    kcal = kj100g / 4.184;
  } else if (energy100g != null) {
    kcal = energy100g <= 900 ? energy100g : energy100g / 4.184;
  } else if (servingKcal != null && servingQuantity != null && servingQuantity > 0) {
    kcal = (servingKcal / servingQuantity) * 100;
  }

  if (kcal == null || !Number.isFinite(kcal) || kcal <= 0 || kcal > 900) return null;
  return kcal;
}

/**
 * Fetches nutrition data from OpenFoodFacts by query.
 */
export async function getNutritionFromOFF(query: string): Promise<NutritionData | null> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json() as OFFSearchResponse;
    const products = json.products ?? [];

    for (const product of products) {
      const n = product.nutriments;
      const kcal = normalizeKcalPer100g(product);
      if (kcal == null || !n) continue;

      return {
        calories: Math.round(kcal),
        protein: readNumber(n.proteins_100g),
        carbs: readNumber(n.carbohydrates_100g),
        fat: readNumber(n.fat_100g),
        source: 'openfoodfacts',
      };
    }

    return null;
  } catch (error) {
    console.warn('[OpenFoodFacts API] Error fetching nutrition:', error);
    return null;
  }
}
