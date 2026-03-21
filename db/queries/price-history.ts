import { getDB } from '../index';

export interface PriceHistoryRecord {
  id: string;
  ingredientId: string;
  price: number; // In TL
  recordedAt: string; // 'YYYY-MM-DD'
}

export async function addPriceRecord(ingredientId: string, price: number, recordedAt?: string): Promise<void> {
  const db = await getDB();
  const date = recordedAt || new Date().toISOString().split('T')[0];
  const priceKurus = Math.round(price * 100);
  const id = Math.random().toString(36).substr(2, 9);

  await db.runAsync(
    'INSERT OR REPLACE INTO price_history (id, ingredient_id, price_kurus, recorded_at) VALUES (?, ?, ?, ?)',
    id, ingredientId, priceKurus, date
  );
}

export async function getPriceHistory(ingredientId: string): Promise<PriceHistoryRecord[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM price_history WHERE ingredient_id = ? ORDER BY recorded_at DESC',
    ingredientId
  );

  return rows.map(row => ({
    id: row.id,
    ingredientId: row.ingredient_id,
    price: row.price_kurus / 100,
    recordedAt: row.recorded_at
  }));
}
