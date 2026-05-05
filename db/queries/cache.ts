import { getDB } from '../index';

export async function getTranslation(english: string): Promise<string | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>(
    'SELECT turkish FROM translations WHERE english = ?',
    english
  );
  return row ? row.turkish : null;
}

export async function setTranslation(english: string, turkish: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT OR REPLACE INTO translations (english, turkish) VALUES (?, ?)',
    english, turkish
  );
}

export async function getCalorieCache(searchTerm: string): Promise<any | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM calorie_cache WHERE search_term = ?',
    searchTerm
  );
  return row;
}

export async function setCalorieCache(searchTerm: string, data: any): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO calorie_cache (
      search_term, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    searchTerm, data.calories, data.protein, data.carbs, data.fat, data.source
  );
}

export async function getManualGramOverride(ingredientName: string, unit: string): Promise<number | null> {
  const cached = await getCalorieCache(`manual_gram:${ingredientName}:${unit}`);
  const value = cached?.calories_per_100g;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export async function setManualGramOverride(ingredientName: string, unit: string, grams: number): Promise<void> {
  await setCalorieCache(`manual_gram:${ingredientName}:${unit}`, {
    calories: grams,
    protein: null,
    carbs: null,
    fat: null,
    source: 'manual',
  });
}

export async function getMigrosCache(searchTerm: string): Promise<any[] | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>(
    'SELECT results_json FROM migros_cache WHERE search_term = ? AND created_at > datetime("now", "-1 day")',
    searchTerm
  );
  return row ? JSON.parse(row.results_json) : null;
}

export async function setMigrosCache(searchTerm: string, results: any[]): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT OR REPLACE INTO migros_cache (search_term, results_json, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    searchTerm, JSON.stringify(results)
  );
}

export async function cleanExpiredCache(): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM migros_cache WHERE created_at < datetime("now", "-1 day")');
}

export async function clearCalorieCache(): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM calorie_cache')
}
