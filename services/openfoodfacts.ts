import { NutritionData } from '@/types/api';

/**
 * Fetches nutrition data from OpenFoodFacts by query.
 * Returns the first product with energy-kcal_100g field.
 */
export async function getNutritionFromOFF(query: string): Promise<NutritionData | null> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();
    const products = json?.products ?? [];

    for (const product of products) {
      const n = product.nutriments;
      if (!n) continue;

      // Önce kcal alanına bak
      let kcal: number | null = null;

      if (n['energy-kcal_100g'] != null) {
        const raw = n['energy-kcal_100g']
        // 900 kcal/100g üstü saçma — muhtemelen kJ cinsinden gelmiş
        kcal = raw < 900 ? raw : raw / 4.184
      } else if (n['energy-kj_100g'] != null) {
        // Sadece kJ var, kcal'e çevir
        kcal = n['energy-kj_100g'] / 4.184
      } else if (n['energy_100g'] != null) {
        // Genel energy alanı — kJ mi kcal mi belli değil
        // 900 üstüyse kJ varsay
        const raw = n['energy_100g']
        kcal = raw < 900 ? raw : raw / 4.184
      }

      if (kcal == null || kcal <= 0) continue

      // Mantıklı aralık kontrolü: 0-900 kcal/100g
      // (saf yağ ~900, su 0 — bu aralık dışı saçma)
      if (kcal > 900) kcal = 900

      return {
        calories: Math.round(kcal),
        protein: n['proteins_100g'] ?? null,
        carbs: n['carbohydrates_100g'] ?? null,
        fat: n['fat_100g'] ?? null,
        source: 'openfoodfacts',
      }
    }

    return null
  } catch (error) {
    console.warn('[OpenFoodFacts API] Error fetching nutrition:', error)
    return null
  }
}