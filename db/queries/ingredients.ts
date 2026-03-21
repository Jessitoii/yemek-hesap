import { getDB } from '../index';
import { Ingredient } from '../../types/ingredient';
import { addPriceRecord } from './price-history';

export async function getIngredients(): Promise<Ingredient[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>('SELECT * FROM ingredients ORDER BY name_tr ASC');
  return rows.map(row => ({
    id: row.id,
    name: row.name_tr,
    imageUrl: row.image_url,
    migrosProductId: row.migros_product_id,
    lastKnownPrice: row.migros_price_kurus / 100,
    nutrition: {
      calories: row.calories_per_100g,
      protein: row.protein_per_100g,
      carbs: row.carbs_per_100g,
      fat: row.fat_per_100g,
      servingSize: 100,
      unit: 'g'
    },
    priceSyncDate: new Date(row.migros_price_updated_at),
    custom: row.manually_added === 1
  }));
}

export async function saveIngredient(ingredient: Ingredient): Promise<void> {
  const db = await getDB();
  const priceKurus = Math.round((ingredient.lastKnownPrice || 0) * 100);
  const syncDate = ingredient.priceSyncDate?.toISOString() || new Date().toISOString();

  await db.runAsync(
    `INSERT OR REPLACE INTO ingredients (
      id, name_tr, image_url, source, manually_added, 
      calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, 
      nutrition_source, migros_price_kurus, migros_price_updated_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    ingredient.id,
    ingredient.name,
    ingredient.imageUrl ?? null,
    ingredient.custom ? 'user' : 'themealdb',
    ingredient.custom ? 1 : 0,
    ingredient.nutrition.calories,
    ingredient.nutrition.protein,
    ingredient.nutrition.carbs,
    ingredient.nutrition.fat,
    'manual', // simplified
    priceKurus,
    syncDate
  );

  // Also record in history
  if (ingredient.lastKnownPrice !== undefined) {
    await addPriceRecord(ingredient.id, ingredient.lastKnownPrice, syncDate.split('T')[0]);
  }
}

export async function deleteIngredient(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM ingredients WHERE id = ?', id);
}
