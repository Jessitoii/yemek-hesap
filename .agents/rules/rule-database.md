---
trigger: model_decision
description: # Veritabanı Kuralları
---

## Erişim Katmanı

Raw SQL yalnızca `db/queries/` içinde. Bileşenlerde, store'larda, hook'larda SQL yasak.

```typescript
// ✓ Doğru — query fonksiyonu yaz
// db/queries/recipes.ts
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const db = getDb()
  return db.getFirstAsync<Recipe>('SELECT * FROM recipes WHERE id = ?', [id])
}

// ✗ Yanlış — ekranda SQL
const recipe = await db.runAsync('SELECT * FROM recipes WHERE id = ?', [id])
```

## Migration Kuralları

- Mevcut migration'ları **asla değiştirme** — yeni numara ile yeni migration ekle
- Migration'lar uygulama açılışında otomatik çalışır, yalnızca bir kez
- Sıradaki numara: mevcut en yüksek + 1

```typescript
// db/migrations/012_yeni_ekleme.ts
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    ALTER TABLE recipes ADD COLUMN new_field TEXT;
  `)
}
```

## Veri Tipi Kuralları

| Veri | SQLite tipi | Not |
|---|---|---|
| ID | TEXT | UUID: `generateId()` |
| Tarih | TEXT | `'YYYY-MM-DD'` formatı |
| Fiyat | INTEGER | Kuruş: `Math.round(tl * 100)` |
| Boolean | INTEGER | `0` veya `1` |
| JSON array | TEXT | `JSON.stringify()` ile yaz, `JSON.parse()` ile oku |

## Yaygın Sorgular

```typescript
// Bugünün log'u — yok ise oluştur
const today = new Date().toISOString().split('T')[0]
let log = await db.getFirstAsync<DailyLog>(
  'SELECT * FROM daily_log WHERE date = ?', [today]
)
if (!log) {
  await db.runAsync(
    'INSERT INTO daily_log (id, date) VALUES (?, ?)',
    [generateId(), today]
  )
}

// Günlük toplam güncelle (öğün ekleme/silme sonrası)
await db.runAsync(`
  UPDATE daily_log SET
    total_calories   = (SELECT COALESCE(SUM(calories), 0)   FROM meals WHERE log_id = ?),
    total_spending_tl = (SELECT COALESCE(SUM(cost_tl), 0)   FROM meals WHERE log_id = ?),
    total_protein_g  = (SELECT COALESCE(SUM(protein_g), 0)  FROM meals WHERE log_id = ?),
    total_carbs_g    = (SELECT COALESCE(SUM(carbs_g), 0)    FROM meals WHERE log_id = ?),
    total_fat_g      = (SELECT COALESCE(SUM(fat_g), 0)      FROM meals WHERE log_id = ?)
  WHERE id = ?
`, [logId, logId, logId, logId, logId, logId])
```

## CASCADE Silme Zinciri

Silindiğinde ne otomatik silinir:
- `daily_log` silinir → `meals` + `activity_log` silinir
- `recipes` silinir → `recipe_ingredients` silinir
- `ingredients` silinir → `price_history` silinir
- `meal_plans` silinir → `meal_plan_items` silinir

## Temizlik (Uygulama Açılışında, Arka Planda)

```sql
-- 365 günden eski log'ları sil (kullanıcı ayarına göre)
DELETE FROM daily_log WHERE date < date('now', '-365 days');

-- 24 saatten eski Migros cache'ini sil
DELETE FROM migros_cache WHERE created_at < datetime('now', '-1 day');
```

Bunu UI yüklendikten sonra arka planda çalıştır — açılışı yavaşlatma.